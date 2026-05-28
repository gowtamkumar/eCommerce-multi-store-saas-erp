export interface PRItem {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  product?: {
    name: string;
  };
}

export interface PR {
  id: string;
  prNumber: string;
  status: string;
  justification?: string;
  requiredDate: string;
  createdAt: string;
  requestedBy?: { name: string };
  items: PRItem[];
}
