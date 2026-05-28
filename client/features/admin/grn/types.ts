import { GrnStatus } from '@/lib/enums/grn-status.enum';

export interface GrnItem {
  product?: { name: string };
  variant?: { name: string };
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
}

export interface GrnData {
  id: string;
  grnNumber: string;
  status: GrnStatus;
  poId: string;
  purchaseOrder?: { referenceNumber: string };
  items: GrnItem[];
  notes?: string;
  supplier?: { name: string };
  warehouse?: { name: string };
  branch?: { name: string };
  receivedByUser?: { name: string };
  receivedDate: string;
  createdAt: string;
}
