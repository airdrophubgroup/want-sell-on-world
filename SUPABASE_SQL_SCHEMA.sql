-- ============================================================
-- WantSell — BASE SCHEMA (fresh Supabase project)
-- Run in Supabase Dashboard -> SQL Editor, top to bottom.
--
-- Use this only when you are rebuilding the backend, i.e. the original
-- project is gone. If the project was merely paused, resume it instead and
-- keep the existing data (see BACKEND_RECOVERY.md).
--
-- Order on a brand-new project:
--   1. SUPABASE_SQL_SCHEMA.sql        <- this file: tables, policies, bucket
--   2. SUPABASE_SQL_SOW_SECURITY.sql  <- server-side SOW credits + ledger
--   3. SUPABASE_SQL_DELETE.sql        <- delete_ad()
--   4. SUPABASE_SQL_FIX.sql           <- mark_ad_sold()
--   5. SUPABASE_SQL_ACCESS_HARDEN.sql <- rate limits, append-only rules
--
-- The column names below are exactly what app.js reads and writes.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. users — one row per wallet, used to label listings
-- ------------------------------------------------------------
create table if not exists public.users (
  wallet_address text primary key,
  username       text,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. listings — the marketplace feed
-- ------------------------------------------------------------
create table if not exists public.listings (
  id             bigserial primary key,
  seller_address text not null,
  seller_name    text,
  title          text not null,
  description    text,
  price          numeric(12, 2) not null default 0,
  category       text,
  country        text,
  address        text,
  lat            double precision,
  lng            double precision,
  condition      text default 'used',
  price_type     text default 'fixed',
  image1         text,
  image2         text,
  image3         text,
  image4         text,
  status         text not null default 'active',
  created_at     timestamptz not null default now()
);

create index if not exists listings_status_created_idx
  on public.listings (status, created_at desc);
create index if not exists listings_seller_idx
  on public.listings (lower(seller_address));
create index if not exists listings_category_idx
  on public.listings (category);

-- ------------------------------------------------------------
-- 3. chats — one row per message, keyed by the ad title
-- ------------------------------------------------------------
create table if not exists public.chats (
  id         bigserial primary key,
  sender     text not null,
  receiver   text not null,
  ad_title   text,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists chats_participants_idx
  on public.chats (lower(sender), lower(receiver), created_at);
create index if not exists chats_ad_title_idx
  on public.chats (ad_title);

-- ------------------------------------------------------------
-- 4. reviews — one review per buyer per seller
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id             bigserial primary key,
  seller_address text not null,
  buyer_address  text not null,
  buyer_name     text,
  rating         integer not null check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz not null default now()
);

create unique index if not exists reviews_one_per_buyer
  on public.reviews (lower(seller_address), lower(buyer_address));
create index if not exists reviews_seller_idx
  on public.reviews (lower(seller_address), created_at desc);

-- ------------------------------------------------------------
-- 5. sow_balances — read-only for the browser, credits come from the RPC
--    (sow_ledger is created by SUPABASE_SQL_SOW_SECURITY.sql)
-- ------------------------------------------------------------
create table if not exists public.sow_balances (
  wallet_address text primary key,
  balance        integer not null default 0 check (balance >= 0),
  updated_at     timestamptz not null default now()
);

-- The award function expects lowercase keys.
create unique index if not exists sow_balances_wallet_uniq
  on public.sow_balances (wallet_address);

-- ------------------------------------------------------------
-- 6. Row level security — public read, client writes only where the app needs
--    SUPABASE_SQL_ACCESS_HARDEN.sql removes the update/delete paths below.
-- ------------------------------------------------------------
alter table public.listings     enable row level security;
alter table public.users        enable row level security;
alter table public.chats        enable row level security;
alter table public.reviews      enable row level security;
alter table public.sow_balances enable row level security;

drop policy if exists listings_read_active on public.listings;
create policy listings_read_active on public.listings for select using (true);
drop policy if exists listings_insert_anon on public.listings;
create policy listings_insert_anon on public.listings for insert with check (true);

drop policy if exists users_read on public.users;
create policy users_read on public.users for select using (true);
drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert with check (true);
drop policy if exists users_update on public.users;
create policy users_update on public.users for update using (true) with check (true);

drop policy if exists chats_read on public.chats;
create policy chats_read on public.chats for select using (true);
drop policy if exists chats_insert on public.chats;
create policy chats_insert on public.chats for insert with check (true);

drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (true);

drop policy if exists sow_balances_read on public.sow_balances;
create policy sow_balances_read on public.sow_balances for select using (true);

grant select, insert         on public.listings     to anon, authenticated;
grant select, insert, update on public.users        to anon, authenticated;
grant select, insert         on public.chats        to anon, authenticated;
grant select, insert         on public.reviews      to anon, authenticated;
grant select                 on public.sow_balances to anon, authenticated;

grant usage on sequence public.listings_id_seq to anon, authenticated;
grant usage on sequence public.chats_id_seq    to anon, authenticated;
grant usage on sequence public.reviews_id_seq  to anon, authenticated;

-- ------------------------------------------------------------
-- 7. Storage — public bucket that holds listing photos
--    app.js uploads to storage.from('listing') with a flat file name.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing', 'listing', true)
on conflict (id) do update set public = true;

drop policy if exists listing_read on storage.objects;
create policy listing_read on storage.objects
  for select using (bucket_id = 'listing');

drop policy if exists listing_write on storage.objects;
create policy listing_write on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'listing');

commit;

-- ============================================================
-- Verify
-- ============================================================
-- select table_name from information_schema.tables
--  where table_schema = 'public' order by 1;   -- listings, users, chats, reviews, ...
-- select id, public from storage.buckets where id = 'listing';  -- public = true
--
-- Then run, in order:
--   SUPABASE_SQL_SOW_SECURITY.sql
--   SUPABASE_SQL_DELETE.sql
--   SUPABASE_SQL_FIX.sql
--   SUPABASE_SQL_ACCESS_HARDEN.sql
-- and finally: npm run check:backend
