-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.languages (
  code text NOT NULL,
  name text NOT NULL,
  direction text DEFAULT 'ltr'::text,
  status text DEFAULT 'active'::text,
  flag_code text,
  is_default boolean DEFAULT false,
  CONSTRAINT languages_pkey PRIMARY KEY (code)
);
CREATE TABLE public.navigation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  menu_id uuid,
  parent_id uuid,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'link'::text,
  value text,
  icon text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  language_code text DEFAULT 'tr'::text,
  CONSTRAINT navigation_items_pkey PRIMARY KEY (id),
  CONSTRAINT navigation_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.navigation_menus(id),
  CONSTRAINT navigation_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.navigation_items(id)
);
CREATE TABLE public.navigation_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT navigation_menus_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  group_name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_dislikes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  post_id bigint,
  CONSTRAINT post_dislikes_pkey PRIMARY KEY (id),
  CONSTRAINT post_dislikes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT post_dislikes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  post_id bigint,
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  post_id bigint,
  CONSTRAINT post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT post_saves_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  platform text,
  created_at timestamp with time zone DEFAULT now(),
  post_id bigint,
  CONSTRAINT post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT post_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT post_shares_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.posts (
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  publisher_id uuid,
  title text,
  summary text,
  content text,
  category text,
  type text,
  thumbnail_url text,
  media_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  card_data jsonb,
  slug text UNIQUE,
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft'::text,
  seo_title text,
  seo_description text,
  keywords text,
  language_code text DEFAULT 'tr'::text,
  published_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  is_pinned boolean DEFAULT false,
  search_vector tsvector,
  dislikes_count integer DEFAULT 0,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_publisher_id_fk_profiles FOREIGN KEY (publisher_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  role text DEFAULT 'member'::text,
  slug text,
  about_me text,
  social_links jsonb DEFAULT '{}'::jsonb,
  balance numeric DEFAULT 0,
  pageviews integer DEFAULT 0,
  status text DEFAULT 'Aktif'::text,
  reward_system boolean DEFAULT false,
  phone text,
  expertise text,
  foundation_date text,
  website text,
  address text,
  meta_title text,
  meta_keywords text,
  meta_description text,
  canonical_url text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  search_vector tsvector,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.publisher_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  publisher_id uuid,
  category_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publisher_categories_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_categories_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.navigation_items(id)
);
CREATE TABLE public.publisher_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  publisher_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publisher_follows_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_follows_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.publisher_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  publisher_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publisher_users_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_users_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL,
  permission_key text NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_key),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_key_fkey FOREIGN KEY (permission_key) REFERENCES public.permissions(key)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  color text DEFAULT '#1D4259'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_code text NOT NULL UNIQUE,
  site_name text DEFAULT 'Buzz Haber'::text,
  timezone text DEFAULT 'Europe/Istanbul'::text,
  footer_about text,
  optional_url_button_name text,
  copyright_text text,
  logo_url text,
  footer_logo_url text,
  dark_logo_url text,
  email_logo_url text,
  favicon_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  home_title text,
  meta_description text,
  meta_keywords text,
  canonical_url text,
  og_image_url text,
  google_analytics_id text,
  google_search_console_code text,
  bing_verification_code text,
  twitter_username text,
  fb_app_id text,
  organization_legal_name text,
  organization_phone text,
  organization_address text,
  robots_txt text DEFAULT 'User-agent: *
Disallow: /admin/
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml'::text,
  header_custom_codes text,
  footer_custom_codes text,
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  publisher_id uuid NOT NULL,
  title text NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image'::text,
  source_name text,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  story_data jsonb DEFAULT '{}'::jsonb,
  story_markup text DEFAULT ''::text,
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES auth.users(id)
);