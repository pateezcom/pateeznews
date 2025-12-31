

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
  REVIEW = 'REVIEW'
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
  comments: number;
  shares: number;
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
    backDescription: string;
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
  type: 'link' | 'header' | 'dropdown' | 'category';
  value: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  children?: NavigationItem[]; // UI için hiyerarşi
}