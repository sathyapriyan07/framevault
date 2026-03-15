-- Movies metadata expansion (TMDB import = metadata only)
-- Run in Supabase SQL editor.

alter table public.movies
  add column if not exists original_title text,
  add column if not exists release_date date,
  add column if not exists poster_path text,
  add column if not exists backdrop_path text,
  add column if not exists vote_average numeric,
  add column if not exists runtime integer,
  add column if not exists status text;

