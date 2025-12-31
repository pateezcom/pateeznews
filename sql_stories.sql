
-- Hikayeler (Stories) Tablosu
CREATE TABLE public.stories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    publisher_id uuid NOT NULL,
    title text NOT NULL,
    media_url text NOT NULL,
    media_type text NOT NULL DEFAULT 'image'::text, -- 'image' veya 'video'
    source_name text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    view_count integer DEFAULT 0,
    CONSTRAINT stories_pkey PRIMARY KEY (id),
    CONSTRAINT stories_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS Politikaları
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Herkes aktif hikayeleri görebilir
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Sadece adminler veya kendi hikayesini oluşturanlar yönetebilir
CREATE POLICY "Users can manage their own stories" 
ON public.stories FOR ALL 
USING (auth.uid() = publisher_id);

-- Admin her şeyi yapabilir (Eğer profiles tablosunda role = 'admin' ise)
CREATE POLICY "Admins can manage all stories" 
ON public.stories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- story_management iznini permissions tablosuna ekleme
INSERT INTO public.permissions (key, label, group_name, description)
VALUES ('manage_content', 'İçerik Yönetimi', 'content', 'Hikaye ve diğer içerikleri yönetme yetkisi')
ON CONFLICT (key) DO NOTHING;
