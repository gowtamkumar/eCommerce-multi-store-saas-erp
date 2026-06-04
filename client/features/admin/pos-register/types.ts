export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Branch {
    id: string;
    name: string;
}

export interface PosRegisterTerminal {
    id: string;
    name: string;
    branchId?: string;
    status?: string;
    branch?: Branch;
}

export interface ShiftUser {
    id?: string;
    username?: string;
    email?: string;
}

export interface Shift {
    id: string;
    userId: string;
    user?: ShiftUser;
    register?: { id?: string; name?: string };
    openingTime: string;
    closingTime: string | null;
    openingBalance: number | string;
    closingBalance: number | string | null;
    expectedClosingBalance: number | string;
    difference: number | string | null;
    cashSales: number | string;
    cardSales?: number | string;
    mobileSales?: number | string;
    cashIn?: number | string;
    cashOut?: number | string;
    status: ShiftStatus;
    remarks?: string;
}

export type ShiftSortKey =
    | 'cashier'
    | 'terminal'
    | 'openingTime'
    | 'closingTime'
    | 'expected'
    | 'actual'
    | 'variance'
    | 'status';

export interface RegisterFormData {
    name: string;
    branchId: string;
    status: string;
}
