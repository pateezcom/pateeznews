
export enum NewsType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  GALLERY = 'GALLERY',
  EMBED = 'EMBED',
  STANDARD = 'STANDARD',
  POLL = 'POLL',
  QUIZ = 'QUIZ',
  VS = 'VS',
  IMAGE = 'IMAGE',
  FLIP_CARD = 'FLIP_CARD',
  BEFORE_AFTER = 'BEFORE_AFTER',
  REVIEW = 'REVIEW',
  PARAGRAPH = 'PARAGRAPH'
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  image?: string;
}

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  summary: string;
  content?: string; // Detaylı haber içeriği
  category: string;
  source: string;
  author: string;
  timestamp: string;
  mediaUrl: string;
  mediaList?: string[];
  thumbnail: string;
  likes: number;
  dislikes?: number;
  comments: number;
  shares: number;
  views: number;
  options?: PollOption[];
  quizDescription?: string;
  totalVotes?: number;
  isImagePoll?: boolean;
  pollColumns?: 2 | 3;
  videoDuration?: string;
  flipData?: {
    frontImage: string;
    frontTitle: string;
    backImage: string;
    backTitle: string;
    frontDescription?: string;
    backDescription?: string;
    frontLink?: string;
    backLink?: string;
  };
  beforeAfterData?: {
    beforeImage: string;
    afterImage: string;
    beforeLabel: string;
    afterLabel: string;
  };
  reviewData?: {
    productName: string;
    productImage: string;
    score: number;
    pros: string[];
    cons: string[];
    breakdown: { label: string; score: number }[];
    verdict: string;
  };
  paragraphData?: {
    items: string[];
    quoteAuthor?: string;
  };
  items?: any[];
  sourceAvatar?: string;
  isPinned?: boolean;
  // User specific interaction states (pre-fetched for speed)
  userLiked?: boolean;
  userSaved?: boolean;
  userDisliked?: boolean;
  publisherId?: string;
  isFollowingPublisher?: boolean;
}

export interface StoryItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  sourceName?: string;
  publisherId?: string;
  createdAt?: string;
  expiresAt?: string;
  isActive: boolean;
  viewCount?: number;
  storyData?: any;
  storyMarkup?: string;
}

// --- NEW ROLE & PERMISSION TYPES ---

export interface Role {
  id: string;
  name: string; // admin, moderator etc.
  label: string; // Yönetici, Moderatör
  description: string;
  color: string;
}

export interface Permission {
  id: string;
  key: string;
  label: string;
  group_name: 'sidebar' | 'system' | 'content';
  description: string;
}

export interface RolePermission {
  role_id: string;
  permission_key: string;
}

// --- NAVIGATION TYPES ---

export interface NavigationMenu {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface NavigationItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  type: 'link' | 'header' | 'dropdown' | 'category' | 'trends' | 'district';
  value: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  language_code?: string;
  children?: NavigationItem[]; // UI için hiyerarşi
}

// --- SITE SETTINGS ---
export interface SiteSettings {
  id: string;
  language_code: string;
  site_name: string;
  timezone: string;
  footer_about: string;
  optional_url_button_name: string;
  copyright_text: string;
  logo_url: string;
  footer_logo_url: string;
  dark_logo_url: string;
  email_logo_url: string;
  favicon_url: string;
  home_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_image_url?: string;
  organization_legal_name?: string;
  organization_phone?: string;
  organization_address?: string;
  twitter_username?: string;
  fb_app_id?: string;
  google_analytics_id?: string;
  google_search_console_code?: string;
  bing_verification_code?: string;
  robots_txt?: string;
  header_custom_codes?: string;
  footer_custom_codes?: string;
}