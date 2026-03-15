-- Media Assets (Storage-backed uploads)
-- Run in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- 1) Table
create table if not exists public.media_assets (
  id uuid primary key default uuid_generate_v4(),
  movie_id uuid references public.movies(id) on delete cascade,
  type text not null check (type in ('logo', 'poster', 'backdrop', 'wallpaper')),
  file_path text not null,
  created_at timestamptz default now()
);

create index if not exists idx_media_assets_movie_id on public.media_assets(movie_id);
create index if not exists idx_media_assets_type on public.media_assets(type);
create index if not exists idx_media_assets_created_at on public.media_assets(created_at desc);

-- 2) RLS
alter table public.media_assets enable row level security;

do $$
begin
  begin
    create policy "Public read access" on public.media_assets
      for select using (true);
  exception when duplicate_object then null;
  end;

  begin
    create policy "Admin write access" on public.media_assets
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

-- 3) Storage policies (bucket: media)
-- Create the bucket in Dashboard: Storage -> Buckets -> "media" (public).
-- You may need to run these as the `postgres` role.
do $$
begin
  begin
    create policy "Public read media bucket" on storage.objects
      for select using (bucket_id = 'media');
  exception when duplicate_object then null;
  end;

  begin
    create policy "Admin write media bucket" on storage.objects
      for all
      using (
        bucket_id = 'media'
        and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      )
      with check (
        bucket_id = 'media'
        and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      );
  exception when duplicate_object then null;
  end;
end $$;
