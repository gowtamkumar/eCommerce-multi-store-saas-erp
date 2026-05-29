export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RECEIVED = 'received',   // Items physically back in warehouse/store
  REJECTED = 'rejected',
  REFUNDED = 'refunded',   // Money/credit issued back to customer
  EXCHANGED = 'exchanged', // Exchange completed (new sale linked)
  CANCELLED = 'cancelled', // Customer withdrew the request
}
