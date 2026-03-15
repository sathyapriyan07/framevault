-- Add optional TMDB fields to media_assets (safe to run multiple times)
-- Run in Supabase SQL editor.

alter table public.media_assets
  add column if not exists url text,
  add column if not exists width integer,
  add column if not exists height integer;

