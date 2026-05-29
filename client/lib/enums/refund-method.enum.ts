export enum RefundMethod {
    STORE_CREDIT = 'store_credit',
    CASH = 'cash',
    CARD = 'card',
    MOBILE = 'mobile',
    BANK_TRANSFER = 'bank_transfer',
}

export enum ReturnType {
    REFUND = 'refund',
    EXCHANGE = 'exchange',
}

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
    [RefundMethod.STORE_CREDIT]: 'Store Credit (Wallet)',
    [RefundMethod.CASH]: 'Cash Refund',
    [RefundMethod.CARD]: 'Card / Bank Refund',
    [RefundMethod.MOBILE]: 'Mobile Payment Refund',
    [RefundMethod.BANK_TRANSFER]: 'Bank Transfer',
}
