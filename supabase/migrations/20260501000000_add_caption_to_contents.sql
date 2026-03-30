-- Add caption to contents for quote reflections
ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS caption TEXT;

-- keep row-level security unchanged; existing policies allow select by published and author.
