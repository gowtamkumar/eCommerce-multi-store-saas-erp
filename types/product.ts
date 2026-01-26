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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
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
  categoryId?: string;
  category?: Category;
  faqs?: Array<{ question: string; answer: string; order?: number }>;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}
