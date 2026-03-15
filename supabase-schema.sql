-- Media Archive Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Movies table
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  original_title TEXT,
  type TEXT CHECK (type IN ('movie', 'series')),
  poster_url TEXT,
  backdrop_url TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  release_date DATE,
  vote_average NUMERIC,
  runtime INTEGER,
  status TEXT,
  release_year INTEGER,
  genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallpapers table
CREATE TABLE wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  resolution TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logos table
CREATE TABLE logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  logo_url TEXT NOT NULL,
  png_download TEXT,
  svg_download TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posters table
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  poster_url TEXT NOT NULL,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backdrops table
CREATE TABLE backdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  backdrop_url TEXT NOT NULL,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persons table
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id INTEGER,
  name TEXT NOT NULL,
  profile_url TEXT,
  biography TEXT,
  birthday DATE,
  deathday DATE,
  place_of_birth TEXT,
  known_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Person wallpapers table
CREATE TABLE person_wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  resolution TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_movies_type ON movies(type);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_wallpapers_movie_id ON wallpapers(movie_id);
CREATE INDEX idx_logos_movie_id ON logos(movie_id);
CREATE INDEX idx_posters_movie_id ON posters(movie_id);
CREATE INDEX idx_backdrops_movie_id ON backdrops(movie_id);
CREATE INDEX idx_persons_tmdb_id ON persons(tmdb_id);
CREATE INDEX idx_person_wallpapers_person_id ON person_wallpapers(person_id);

-- Enable Row Level Security (RLS)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE backdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_wallpapers ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON wallpapers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON logos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON posters FOR SELECT USING (true);
CREATE POLICY "Public read access" ON backdrops FOR SELECT USING (true);
CREATE POLICY "Public read access" ON persons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON person_wallpapers FOR SELECT USING (true);

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admin write access (you'll need to set up admin users)
CREATE POLICY "Admin write access" ON movies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON wallpapers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON logos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON posters FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON backdrops FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON persons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin write access" ON person_wallpapers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
