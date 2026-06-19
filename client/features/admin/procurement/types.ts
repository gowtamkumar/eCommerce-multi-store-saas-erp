import { Product } from "@/features/admin/product/types";

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

export interface StatItem {
  label: string;
  value: string;
  subValue: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

export interface ChartItem {
  name: string;
  spend: number;
}

export type ProductWithStock = Product & { stock?: number; lowStockThreshold?: number };

export interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ConvertRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pr: PR | null;
  onSuccess: () => void;
}

export interface RequisitionDetailDrawerProps {
  pr: PR | null;
  onClose: () => void;
  onMovePR: (id: string, newStatus: string) => Promise<void>;
  onDeletePR: (id: string) => Promise<void>;
  onOpenConvertModal: (pr: PR) => void;
}

export interface Quotation {
  id: string;
  supplierId: string;
  supplier?: { name: string };
  totalAmount: number;
  leadTimeDays: number;
  termsAndConditions?: string;
  status: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  deadlineDate: string;
  status: string;
  prId?: string;
  purchaseRequisition?: {
    prNumber: string;
    justification?: string;
    requiredDate?: string;
    items?: Array<{
      quantity: number;
      notes?: string;
      product?: { name: string };
    }>;
  };
  createdBy?: { name: string };
  quotations: Quotation[];
}

export interface CreateRfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface SubmitBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQ | null;
  onSuccess: () => void;
}

export interface RfqDetailDrawerProps {
  rfq: RFQ | null;
  onClose: () => void;
  onOpenBidModal: () => void;
  onAwardBid: (quotationId: string) => Promise<void>;
}

export interface SupplierInvoiceItem {
  id: string;
  productId: string;
  product?: { name: string };
  quantity: number;
  unitPrice: number;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: { name: string };
  purchaseOrderId: string;
  purchaseOrder?: { referenceNumber: string };
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  matchStatus: string;
  discrepancyNotes?: string;
  items: SupplierInvoiceItem[];
}

export interface SupplierInvoiceListPageProps {
  invoices: SupplierInvoice[];
  loading: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSelectInvoice: (invoice: SupplierInvoice) => void;
  onOpenCreateModal: () => void;
}

export interface SupplierInvoiceDetailDrawerProps {
  invoice: SupplierInvoice | null;
  onClose: () => void;
  onOpenPayModal: () => void;
}

export interface ReceiveInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SupplierInvoice | null;
  onSuccess: () => void;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  supplierId: string;
  supplier?: { name: string };
  purchaseOrderId: string;
  purchaseOrder?: { referenceNumber: string };
  amount: number;
  createdAt: string;
  reason: string;
  status: string;
}

export interface DebitNotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DebitNoteListPageProps {
  debitNotes: DebitNote[];
  loading: boolean;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  pagination: DebitNotePagination;
  onSelectNote: (note: DebitNote) => void;
  onPageChange: (page: number) => void;
  onOpenCreateModal: () => void;
}

export interface DebitNoteDetailDrawerProps {
  note: DebitNote | null;
  onClose: () => void;
  onApprove: (id: string) => void;
}

export interface CreateDebitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}



