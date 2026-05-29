export enum RefundMethod {
  STORE_CREDIT = 'store_credit',  // Credited to customer's wallet
  CASH = 'cash',                  // Physical cash refund at counter
  CARD = 'card',                  // Card/bank reversal
  MOBILE = 'mobile',              // Mobile payment reversal
  BANK_TRANSFER = 'bank_transfer', // Manual bank transfer
}

export enum ReturnType {
  REFUND = 'refund',     // Customer wants money/credit back
  EXCHANGE = 'exchange', // Customer wants different product
}
