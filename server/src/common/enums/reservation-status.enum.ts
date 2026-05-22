export enum ReservationStatus {
  /** Stock is held; not yet consumed or released. */
  ACTIVE = 'ACTIVE',
  /** All reserved quantity has been consumed by a shipment. */
  FULFILLED = 'FULFILLED',
  /** Reservation was explicitly released (e.g. order cancelled). */
  RELEASED = 'RELEASED',
  /** Reservation expired because expiresAt passed without fulfilment. */
  EXPIRED = 'EXPIRED',
}
