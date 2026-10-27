-- ============================================================
-- WantSell — USERNAME OWNERSHIP GUARD
-- Run after SUPABASE_SQL_ACCESS_HARDEN.sql (Supabase Dashboard -> SQL Editor).
--
-- Why this exists
-- users.wallet_address is the row key and users.username is the name shown on
-- every listing card, chat and review. Two things were wrong with it:
--
--   1. the same username could be claimed by many wallets, so one name could be
--      made to appear on everybody's ads;
--   2. the browser (anon key) could rewrite the wallet_address column itself,
--      which moves a whole row - and its name - onto another wallet.
--
-- The app side now stores a name only under the wallet that owns it, and never
-- prints a name belonging to a different address. This file makes the same rules
-- hold in the database, for every client, including curl.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0. Look before you lock: if a name is already claimed by more than one
--    wallet, the unique index below will refuse to build. Resolve the clash
--    first (keep the wallet that really owns the World App username).
--
--    select lower(username) as name, count(*) as wallets,
--           array_agg(wallet_address order by created_at) as addresses
--      from public.users
--     where username is not null
--     group by 1
--    having count(*) > 1;
-- ------------------------------------------------------------

-- 1. One World App username belongs to exactly one wallet.
create unique index if not exists users_username_uniq
  on public.users (lower(username))
  where username is not null;

-- 2. The browser may only ever write the username column. A row key can no
--    longer be rewritten, so a name cannot be re-pointed at another wallet.
--    (The app's upsert still works: it needs INSERT plus UPDATE (username).)
revoke update on public.users from anon, authenticated;
grant  update (username) on public.users to anon, authenticated;

-- 3. Real wallet addresses only, and no blank or padded names.
alter table public.users drop constraint if exists users_wallet_format;
alter table public.users
  add constraint users_wallet_format
  check (wallet_address ~* '^0x[0-9a-f]{40}$');

alter table public.users drop constraint if exists users_username_length;
alter table public.users
  add constraint users_username_length
  check (username is null or char_length(btrim(username)) between 2 and 20);

-- 4. Keep the claim/rename time, so a stale snapshot can always be compared
--    with the live name.
alter table public.users
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.ws_touch_user()
returns trigger
language plpgsql
as $$
begin
  new.username := btrim(new.username);
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists users_touch on public.users;
create trigger users_touch
  before insert or update on public.users
  for each row execute function public.ws_touch_user();

commit;

-- ============================================================
-- Verify
-- ============================================================
-- select indexname from pg_indexes
--  where tablename = 'users' and indexname = 'users_username_uniq';   -- 1 row
-- select grantee, privilege_type, column_name
--   from information_schema.column_privileges
--  where table_name = 'users' and privilege_type = 'UPDATE';          -- username only
--
-- Then probe from a browser console (must fail, and must NOT rename a row):
--   fetch(URL + '/rest/v1/users?wallet_address=eq.0xSOMEONE_ELSE', {
--     method: 'PATCH',
--     headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
--     body: JSON.stringify({ wallet_address: '0x' + '1'.repeat(40) })
--   }).then(r => r.text());

-- ============================================================
-- Known limitation (needs a server to fix, not RLS)
-- With the public anon key the database cannot prove which wallet is calling,
-- so a script can still rename an existing wallet's username to a name that is
-- still free. What is already impossible is one name being shared by many
-- wallets, and moving a row onto a different wallet. Closing the rest needs the
-- World ID backend (verify the proof server-side, then write with the service
-- key). Same for chats (any client can read any conversation) and
-- listings.lat/lng (exact seller coordinates are in the public feed).
-- ============================================================
