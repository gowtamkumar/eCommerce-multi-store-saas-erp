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
  lowStockThreshold?: number;
  images?: string[];
  isDefault?: boolean;
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
  sku: string;
  tags?: string[];
  description: string;
  shortDescription?: string;
  price: number;
  discountAmount?: number;
  discountType?: 'fixed' | 'percentage';
  images: string[];
  features?: string[];
  stock: number;
  lowStockThreshold?: number;
  taxRate?: number;
  status: 'active' | 'inactive';
  categoryId?: string;
  category?: Category;
  brand?: { id: string; name: string };
  supplier?: { id: string; name: string };
  applicablePromotions?: any[];
  faqs?: Array<{ question: string; answer: string; order?: number }>;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  landingPage?: { id: string; slug: string };
  createdAt?: string;
  updatedAt?: string;
}



export interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    name: string;
    email: string;
  }
}
