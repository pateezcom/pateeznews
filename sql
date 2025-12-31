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
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES auth.users(id)
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
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
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