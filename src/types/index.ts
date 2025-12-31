export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string;
  image?: string | null;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  level?: 'NEW_SELLER' | 'LEVEL_ONE' | 'LEVEL_TWO' | 'TOP_RATED' | string;
  verified?: boolean;
  bio?: string | null;
  skills?: string[];
  location?: string | null;
  memberSince?: string;
  createdAt?: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  image: string;
  price: number;
  seller: User;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  tags: string[];
  features: string[];
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  gigCount: number;
}

export interface Review {
  id: string;
  user: User;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}
