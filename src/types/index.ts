export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  level: 'New Seller' | 'Level 1' | 'Level 2' | 'Top Rated';
  verified: boolean;
  bio?: string;
  skills?: string[];
  location?: string;
  memberSince?: string;
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
