
-- stories tablosuna Google Web Stories verileri için kolonlar ekle
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS story_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS story_markup text DEFAULT '';

COMMENT ON COLUMN public.stories.story_data IS 'Google Web Stories editor JSON verisi (pages, layers, styles)';
COMMENT ON COLUMN public.stories.story_markup IS 'Google Web Stories AMP HTML çıktısı';
