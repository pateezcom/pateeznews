-- Add new columns to the posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS keywords text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'; -- 'published', 'draft', 'archived'
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'tr';

-- Ensure publisher_id exists (it was in the provided schema, but just in case)
-- ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS publisher_id uuid REFERENCES auth.users(id);

-- Create table for Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(post_id, user_id), -- A user can like a post only once
    PRIMARY KEY (id)
);

-- Create table for Post Saves (Bookmarks)
CREATE TABLE IF NOT EXISTS public.post_saves (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(post_id, user_id), -- A user can save a post only once
    PRIMARY KEY (id)
);

-- Create table for Post Shares (Tracking shares)
CREATE TABLE IF NOT EXISTS public.post_shares (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User might be null if anonymous share tracking, but usually logged in
    platform text, -- e.g., 'facebook', 'twitter', 'whatsapp'
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_publisher ON public.posts(publisher_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
