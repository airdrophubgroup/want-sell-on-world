-- ============================================================
-- SOW CREDIT SYSTEM — SERVER-AUTHORITATIVE FIX
-- Run in Supabase Dashboard -> SQL Editor, once, top to bottom.
--
-- Before this migration the browser computed the balance itself:
--     read sow_balances -> +1 -> upsert
-- With the public anon key in the bundle, ANY visitor could PATCH their own
-- row to any value, or award themselves coins without posting anything.
--
-- After this migration:
--   * the browser can only READ sow_balances
--   * credits are written by award_sow_for_listing(), which derives the wallet
--     from the listing row (never from client input)
--   * every award is recorded once in sow_ledger (UNIQUE listing_id), so
--     retries, double taps and concurrent calls cannot double-credit
--   * awards are limited to fresh, active listings and a daily per-wallet cap
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Balance table: normalise wallet casing, add updated_at
-- ------------------------------------------------------------
alter table public.sow_balances
  add column if not exists updated_at timestamptz not null default now();

alter table public.sow_balances
  alter column balance set default 0;

-- Merge case-variant duplicates (0xABC vs 0xabc) keeping the highest balance.
with ranked as (
  select ctid,
         row_number() over (
           partition by lower(wallet_address)
           order by balance desc, updated_at desc
         ) as rn
  from public.sow_balances
)
delete from public.sow_balances b
using ranked r
where b.ctid = r.ctid and r.rn > 1;

update public.sow_balances
set wallet_address = lower(wallet_address)
where wallet_address <> lower(wallet_address);

create unique index if not exists sow_balances_wallet_uniq
  on public.sow_balances (wallet_address);

-- ------------------------------------------------------------
-- 2. Ledger: append-only proof of every credit ever granted
-- ------------------------------------------------------------
create table if not exists public.sow_ledger (
  id            bigserial primary key,
  listing_id    bigint not null unique references public.listings(id) on delete cascade,
  wallet_address text not null,
  amount        integer not null default 1 check (amount > 0 and amount <= 10),
  reason        text not null default 'listing_posted',
  created_at    timestamptz not null default now()
);

create index if not exists sow_ledger_wallet_created_idx
  on public.sow_ledger (lower(wallet_address), created_at desc);

-- ------------------------------------------------------------
-- 3. The only way to earn SOW
-- ------------------------------------------------------------
create or replace function public.award_sow_for_listing(p_ad_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ad        record;
  v_inserted  integer := 0;
  v_balance   integer;
  v_today     integer;
  v_daily_cap constant integer := 20;
begin
  -- Lock the listing row so two concurrent calls for the same ad serialise.
  select id, seller_address, status, created_at
    into v_ad
  from public.listings
  where id = p_ad_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'awarded', false, 'error', 'listing_not_found');
  end if;

  if v_ad.seller_address is null or length(trim(v_ad.seller_address)) = 0 then
    return jsonb_build_object('success', false, 'awarded', false, 'error', 'listing_without_seller');
  end if;

  if v_ad.status is distinct from 'active' then
    return jsonb_build_object('success', false, 'awarded', false, 'error', 'listing_not_active');
  end if;

  -- Only a freshly published ad can be credited (blocks back-crediting old ads).
  if v_ad.created_at < now() - interval '10 minutes' then
    return jsonb_build_object('success', false, 'awarded', false, 'error', 'listing_too_old');
  end if;

  -- Abuse ceiling: even if someone forges listings through the REST API they
  -- cannot mint more than v_daily_cap coins per wallet per day.
  select count(*) into v_today
  from public.sow_ledger
  where lower(wallet_address) = lower(v_ad.seller_address)
    and created_at > now() - interval '1 day';

  if v_today >= v_daily_cap then
    select balance into v_balance
    from public.sow_balances
    where wallet_address = lower(v_ad.seller_address);
    return jsonb_build_object(
      'success', true, 'awarded', false, 'error', 'daily_cap',
      'balance', coalesce(v_balance, 0)
    );
  end if;

  -- One credit per listing, forever. Concurrent duplicates lose here.
  insert into public.sow_ledger (listing_id, wallet_address, amount, reason)
  values (v_ad.id, lower(v_ad.seller_address), 1, 'listing_posted')
  on conflict (listing_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select balance into v_balance
    from public.sow_balances
    where wallet_address = lower(v_ad.seller_address);
    return jsonb_build_object(
      'success', true, 'awarded', false, 'error', 'already_awarded',
      'balance', coalesce(v_balance, 0)
    );
  end if;

  -- Atomic increment; no read-modify-write from the browser.
  insert into public.sow_balances (wallet_address, balance, updated_at)
  values (lower(v_ad.seller_address), 1, now())
  on conflict (wallet_address) do update
    set balance = public.sow_balances.balance + 1,
        updated_at = now()
  returning balance into v_balance;

  return jsonb_build_object('success', true, 'awarded', true, 'balance', v_balance);
end;
$$;

-- Only the function may touch balances; only authenticated RPC callers may run it.
revoke all on function public.award_sow_for_listing(bigint) from public;
grant execute on function public.award_sow_for_listing(bigint) to anon, authenticated;

-- ------------------------------------------------------------
-- 4. Row level security: read-only from the client
-- ------------------------------------------------------------
alter table public.sow_balances enable row level security;
alter table public.sow_ledger   enable row level security;

drop policy if exists sow_balances_read on public.sow_balances;
create policy sow_balances_read on public.sow_balances
  for select using (true);

-- No INSERT/UPDATE/DELETE policy exists => the client cannot write these rows.
drop policy if exists sow_balances_write on public.sow_balances;
drop policy if exists sow_balances_insert on public.sow_balances;
drop policy if exists sow_balances_update on public.sow_balances;

revoke insert, update, delete, truncate on public.sow_balances from anon, authenticated;
grant select on public.sow_balances to anon, authenticated;

-- The ledger is a server-side audit log: no client access at all.
revoke all on public.sow_ledger from anon, authenticated;
revoke all on sequence public.sow_ledger_id_seq from anon, authenticated;

commit;

-- ============================================================
-- Verify (run these after the block above commits)
-- ============================================================
-- a) The client must be unable to write balances. Expect: permission denied
--    select has_table_privilege('anon', 'public.sow_balances', 'UPDATE');  -> false
--    select has_table_privilege('anon', 'public.sow_balances', 'INSERT');  -> false
--    select has_table_privilege('anon', 'public.sow_balances', 'SELECT');  -> true
--
-- b) One credit per listing:
--    select listing_id, count(*) from public.sow_ledger group by 1 having count(*) > 1;  -> 0 rows
--
-- c) Ledger total must equal the sum of all balances:
--    select (select coalesce(sum(balance),0) from public.sow_balances) as balances,
--           (select count(*) from public.sow_ledger)                   as ledger_rows;
--
-- ============================================================
-- KNOWN RESIDUAL RISK (not fixable from the client alone)
-- ============================================================
-- * The 1 WLD listing fee is not verified by a server, so a forged REST insert
--   can still create a listing and earn 1 SOW through the RPC. The daily cap
--   above bounds the damage; closing it fully needs a server that verifies the
--   MiniKit payment payload before inserting the listing.
-- * delete_ad(p_ad_id, p_wallet) and mark_ad_sold(p_ad_id, p_wallet) trust a
--   wallet address supplied by the caller. Seller addresses are public in
--   listings, so they can be spoofed. Replace them with calls that verify a
--   signed walletAuth message before acting.
