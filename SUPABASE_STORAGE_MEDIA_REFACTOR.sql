-- Supabase Storage + Media Tables Refactor
-- Run in Supabase SQL editor (as project owner).
-- This script is designed to be backwards-compatible: it adds `file_path` columns
-- and makes the old URL columns nullable so the app can transition gradually.

-- 1) Create public buckets (if you prefer, do this in the Supabase Dashboard)
-- Note: bucket object paths should NOT include the bucket name.
insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('posters', 'posters', true),
  ('backdrops', 'backdrops', true),
  ('wallpapers', 'wallpapers', true)
on conflict (id) do update set public = excluded.public;

-- 2) Storage policies (public read + admin write)
-- If you already have storage policies, you may skip or adapt these.
-- Postgres does not support CREATE POLICY IF NOT EXISTS, so these are wrapped.
do $$
begin
  -- Note: `storage.objects` is owned by Supabase system roles.
  -- On most projects RLS is already enabled for `storage.objects`.
  -- If you see "must be owner of table objects", you cannot run ALTER TABLE here.
  -- You can safely omit enabling RLS and just create the policies below.

  begin
    create policy "Public read logos" on storage.objects
      for select using (bucket_id = 'logos');
  exception when duplicate_object then null;
  end;

  begin
    create policy "Public read posters" on storage.objects
      for select using (bucket_id = 'posters');
  exception when duplicate_object then null;
  end;

  begin
    create policy "Public read backdrops" on storage.objects
      for select using (bucket_id = 'backdrops');
  exception when duplicate_object then null;
  end;

  begin
    create policy "Public read wallpapers" on storage.objects
      for select using (bucket_id = 'wallpapers');
  exception when duplicate_object then null;
  end;

  begin
    create policy "Admin write storage objects" on storage.objects
      for all
      using (
        exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      )
      with check (
        exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      );
  exception when duplicate_object then null;
  end;
end $$;

-- 3) Add file_path + dimensions to media tables
alter table public.logos
  add column if not exists file_path text,
  add column if not exists width integer,
  add column if not exists height integer;

alter table public.posters
  add column if not exists file_path text,
  add column if not exists width integer,
  add column if not exists height integer;

alter table public.backdrops
  add column if not exists file_path text,
  add column if not exists width integer,
  add column if not exists height integer;

alter table public.wallpapers
  add column if not exists file_path text,
  add column if not exists width integer,
  add column if not exists height integer;

-- 4) Make old remote URL columns optional (so new inserts can store only file_path)
alter table public.logos alter column logo_url drop not null;
alter table public.posters alter column poster_url drop not null;
alter table public.backdrops alter column backdrop_url drop not null;
alter table public.wallpapers alter column image_url drop not null;

-- Optional: once everything is migrated and you no longer need remote URLs,
-- you can drop the old URL columns in a later migration.
