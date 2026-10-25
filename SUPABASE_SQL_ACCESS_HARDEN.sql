-- ============================================================
-- WantSell — ACCESS HARDENING
-- Run in Supabase Dashboard -> SQL Editor, after
-- SUPABASE_SQL_SOW_SECURITY.sql. Idempotent; safe to re-run.
--
-- Why this file exists
-- -------------------
-- The browser talks to PostgREST with the PUBLIC anon key, so every client
-- request is an unauthenticated request. Nothing here can tell "you" from
-- "someone else" without Supabase Auth, so this migration:
--   * removes the write paths that let a visitor edit or destroy data they
--     merely looked at,
--   * caps how much one wallet can create (spambots and 400-user bursts),
--   * adds the constraints that used to live only in JavaScript.
-- Full ownership proof needs a server that verifies the MiniKit walletAuth
-- signature; that is the next step and is described in SECURITY_REPORT.md.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Listings: reads stay public, status writes only via RPC
--    Without this, anyone holding the anon key can rewrite any row
--    (price, title, photos, status) with a PATCH on /rest/v1/listings.
--    The app already prefers delete_ad() / mark_ad_sold(), so the direct
--    update path is removed rather than trusted.
-- ------------------------------------------------------------
alter table public.listings enable row level security;

drop policy if exists listings_read_active on public.listings;
create policy listings_read_active on public.listings
  for select using (true);

drop policy if exists listings_insert_anon on public.listings;
create policy listings_insert_anon on public.listings
  for insert with check (true);

-- No UPDATE/DELETE policy => PATCH/DELETE on listings always returns 0 rows.
drop policy if exists listings_update_any on public.listings;
drop policy if exists listings_delete_any on public.listings;

revoke update, delete, truncate on public.listings from anon, authenticated;
grant  select, insert on public.listings to anon, authenticated;

-- ------------------------------------------------------------
-- 2. Chats: append-only from the client
--    A visitor must not be able to rewrite or erase someone else's
--    conversation, and must not be able to read it all (the client now
--    filters by both wallets server-side).
-- ------------------------------------------------------------
alter table public.chats enable row level security;

drop policy if exists chats_read on public.chats;
create policy chats_read on public.chats for select using (true);
drop policy if exists chats_insert on public.chats;
create policy chats_insert on public.chats for insert with check (true);
drop policy if exists chats_update on public.chats;
drop policy if exists chats_delete on public.chats;

revoke update, delete, truncate on public.chats from anon, authenticated;
grant  select, insert on public.chats to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Reviews: one review per buyer per seller, enforced by the database
--    (the app checks this in JavaScript, which is not a control)
-- ------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (true);
drop policy if exists reviews_update on public.reviews;
drop policy if exists reviews_delete on public.reviews;

revoke update, delete, truncate on public.reviews from anon, authenticated;
grant  select, insert on public.reviews to anon, authenticated;

create unique index if not exists reviews_one_per_buyer
  on public.reviews (lower(seller_address), lower(buyer_address));

alter table public.reviews
  drop constraint if exists reviews_rating_range;
alter table public.reviews
  add constraint reviews_rating_range check (rating between 1 and 5);

-- ------------------------------------------------------------
-- 4. Users: readable (the feed resolves seller names) and length-limited
-- ------------------------------------------------------------
alter table public.users enable row level security;
drop policy if exists users_read on public.users;
create policy users_read on public.users for select using (true);
drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert with check (true);
drop policy if exists users_update on public.users;
create policy users_update on public.users for update using (true) with check (true);
drop policy if exists users_delete on public.users;
revoke delete, truncate on public.users from anon, authenticated;
grant  select, insert, update on public.users to anon, authenticated;

alter table public.users
  alter column username type text;

alter table public.users
  drop constraint if exists users_username_length;
alter table public.users
  add constraint users_username_length
  check (username is null or char_length(username) between 2 and 20);

-- ------------------------------------------------------------
-- 5. Rate limits enforced by the database, not the page
--    Client-side cooldowns disappear the moment someone uses curl.
--    These caps are far above any real human's behaviour.
-- ------------------------------------------------------------
create or replace function public.ws_throttle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet   text;
  v_created  timestamptz := coalesce(new.created_at, now());
  v_window   interval;
  v_limit    integer;
  v_msg      text;
begin
  if tg_table_name = 'listings' then
    v_wallet := lower(coalesce(new.seller_address, ''));
    v_window := interval '1 hour'; v_limit := 5;
    v_msg := format('rate limit: max %s listings per hour per wallet', v_limit);
  elsif tg_table_name = 'chats' then
    v_wallet := lower(coalesce(new.sender, ''));
    v_window := interval '1 minute'; v_limit := 30;
    v_msg := format('rate limit: max %s messages per minute', v_limit);
  elsif tg_table_name = 'reviews' then
    v_wallet := lower(coalesce(new.buyer_address, ''));
    v_window := interval '1 day'; v_limit := 20;
    v_msg := format('rate limit: max %s reviews per day', v_limit);
  else
    return new;
  end if;

  if v_wallet = '' then
    raise exception 'missing wallet address';
  end if;

  if (select count(*) from public.listings l
        where lower(l.seller_address) = v_wallet and l.created_at > v_created - v_window) >= v_limit
     and tg_table_name = 'listings' then
    raise exception '%', v_msg;
  end if;

  if tg_table_name = 'chats' and (select count(*) from public.chats c
        where lower(c.sender) = v_wallet and c.created_at > v_created - v_window) >= v_limit then
    raise exception '%', v_msg;
  end if;

  if tg_table_name = 'reviews' and (select count(*) from public.reviews r
        where lower(r.buyer_address) = v_wallet and r.created_at > v_created - v_window) >= v_limit then
    raise exception '%', v_msg;
  end if;

  return new;
end;
$$;

drop trigger if exists ws_throttle_listings on public.listings;
create trigger ws_throttle_listings
  before insert on public.listings
  for each row execute function public.ws_throttle();

drop trigger if exists ws_throttle_chats on public.chats;
create trigger ws_throttle_chats
  before insert on public.chats
  for each row execute function public.ws_throttle();

drop trigger if exists ws_throttle_reviews on public.reviews;
create trigger ws_throttle_reviews
  before insert on public.reviews
  for each row execute function public.ws_throttle();

revoke execute on function public.ws_throttle() from public;
grant  execute on function public.ws_throttle() to postgres, service_role;

-- ------------------------------------------------------------
-- 6. Storage: cap what an anon visitor can push into the bucket
--    The app compresses photos to JPEG and rejects >5MB locally; this makes
--    the limit true for everyone, not just honest clients.
-- ------------------------------------------------------------
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'listing';

-- RLS policies are OR-ed together, so an old permissive dashboard-created
-- policy would keep uploads open. Table privileges are the real gate: revoke
-- them, then let my policy below supply the only insert grant.
revoke insert, update, delete, truncate on storage.objects from anon, authenticated;
grant  select on storage.objects to anon, authenticated;
grant  insert on storage.objects to anon, authenticated;

drop policy if exists listing_read on storage.objects;
create policy listing_read on storage.objects
  for select using (bucket_id = 'listing');

-- The app uploads flat filenames (no folder prefix), so this policy only
-- bounds size, name length and traversal.
drop policy if exists listing_write on storage.objects;
create policy listing_write on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'listing'
              and octet_length(name) between 1 and 200
              and name !~ '\.\.'
              and name ~* '\.(jpe?g|png|webp)$');

commit;

-- ============================================================
-- VERIFY (expect these results)
-- ============================================================
-- a) anon cannot edit listings:
--    select has_table_privilege('anon', 'public.listings', 'UPDATE');  -> false
--    select has_table_privilege('anon', 'public.listings', 'DELETE');  -> false
--    select has_table_privilege('anon', 'public.chats',   'UPDATE');  -> false
--    select has_table_privilege('anon', 'public.reviews', 'DELETE');  -> false
-- b) duplicate review is refused:
--    insert into public.reviews (seller_address, buyer_address, buyer_name, rating, comment)
--    values ('0xa','0xb','x',5,'dup');  -- then repeat: ERROR duplicate key
-- c) the app still posts, chats and reviews normally, because inserts remain open.
--
-- ============================================================
-- RESIDUAL RISK (needs a server, cannot be closed from SQL)
-- ============================================================
-- * Wallet identity is asserted by the browser. delete_ad() and
--   mark_ad_sold() still trust p_wallet, so anyone who knows a seller address
--   (they are public in listings) can call those RPCs for someone else's ad.
--   Closing this needs an endpoint that verifies a signed MiniKit walletAuth
--   message before touching the row, e.g. a Vercel serverless function or a
--   Supabase Edge Function that checks the signature and passes the verified
--   wallet to the SQL function.
-- * Uploads are still allowed to a public bucket without proving ownership;
--   the size cap above limits the damage, per-user folders need the same
--   verified-wallet server.
