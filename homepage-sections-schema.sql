-- Homepage Sections Table
-- Add this to your Supabase SQL Editor

CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('movies', 'series', 'posters', 'backdrops', 'wallpapers', 'logos', 'persons')),
  limit_count INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_homepage_sections_active ON homepage_sections(is_active, sort_order);

-- Enable Row Level Security
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON homepage_sections FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin write access" ON homepage_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Insert default sections
INSERT INTO homepage_sections (title, type, limit_count, sort_order, is_active) VALUES
('Trending Movies', 'movies', 10, 1, true),
('Latest Wallpapers', 'wallpapers', 10, 2, true),
('Latest Logos', 'logos', 10, 3, true),
('Latest Posters', 'posters', 10, 4, true),
('Latest Backdrops', 'backdrops', 10, 5, true),
('Popular Series', 'series', 10, 6, true);
