export interface ProductAttribute {
  id?: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id?: string;
  sku: string;
  price?: number;
  stock: number;
  images?: string[];
  combination: Record<string, string>;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountAmount?: number;
  images: string[];
  features?: string[];
  stock: number;
  status: 'active' | 'inactive';
  tagline?: string;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  sections?: any[];
  reviewSectionType?: 'testimonials' | 'reviews';
  createdAt?: string;
  updatedAt?: string;
}
