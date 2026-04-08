export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
    referenceNumber?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ExpenseListProps {
    expenses: Expense[];
    loading: boolean;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
}

export interface ExpenseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Expense | null;
}

export const EXPENSE_CATEGORIES = [
    'SHIPPING', 'PACKAGING', 'MARKETING', 'SOFTWARE',
    'SALARIES', 'UTILITIES', 'MAINTENANCE', 'OTHER'
];