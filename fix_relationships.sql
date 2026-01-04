-- Fix the relationship between posts and profiles to enable fetching profile data
-- Supabase requires a foreign key to public.profiles to perform a join with the JS SDK
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_publisher_id_fkey;

-- CAUTION: This assumes all publisher_id values in 'posts' exist in 'profiles'. 
-- Since profiles usually mirror auth.users, this should be safe.
ALTER TABLE public.posts 
    ADD CONSTRAINT posts_publisher_id_fk_profiles 
    FOREIGN KEY (publisher_id) 
    REFERENCES public.profiles(id);

-- Enable RLS and add basic policies to ensure data is visible
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts (needed for the live site and admin panel list if not using service role)
DROP POLICY IF EXISTS "Public read access" ON public.posts;
CREATE POLICY "Public read access" ON public.posts FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (adjust logic as needed for simpler admin access)
DROP POLICY IF EXISTS "Auth write access" ON public.posts;
CREATE POLICY "Auth write access" ON public.posts FOR ALL USING (auth.role() = 'authenticated');

-- Ensure profiles are readable too
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

-- Grant permissions just in case
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
