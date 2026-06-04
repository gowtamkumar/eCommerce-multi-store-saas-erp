import { CartItem, CouponApplied } from '../type';

export const DENOMINATIONS = [
  { label: '$100', value: 100, type: 'bill' },
  { label: '$50', value: 50, type: 'bill' },
  { label: '$20', value: 20, type: 'bill' },
  { label: '$10', value: 10, type: 'bill' },
  { label: '$5', value: 5, type: 'bill' },
  { label: '$1', value: 1, type: 'bill' },
  { label: '¢25', value: 0.25, type: 'coin' },
  { label: '¢10', value: 0.10, type: 'coin' },
  { label: '¢5', value: 0.05, type: 'coin' },
  { label: '¢1', value: 0.01, type: 'coin' },
];

export const DELIVERY_ZONES = [
  { name: 'Store Counter Pickup', fee: 0 },
  { name: 'Inside City Zone (Standard)', fee: 60 },
  { name: 'Inside City Zone (Express)', fee: 100 },
  { name: 'Outside City Zone (Standard)', fee: 120 },
  { name: 'Outside City Zone (Express)', fee: 180 },
];

/**
 * Generates a local transaction UUID.
 */
export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Emits a POS scan beep sound.
 */
export function playBeepSound(): void {
  try {
    const windowWithAudio = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtxConstructor = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
    if (!AudioCtxConstructor) {
      throw new Error('AudioContext is not supported');
    }
    const audioCtx = new AudioCtxConstructor();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e: unknown) {
    console.warn('AudioContext beep blocked or not supported:', e);
  }
}

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function calculateCatalogDiscount(cart: CartItem[]): number {
  return cart.reduce((acc, item) => {
    const discAmt = Number(item.product.discountAmount || 0);
    if (discAmt <= 0) return acc;
    const discType = item.product.discountType || 'fixed';
    const unitDiscountedPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;
    const discountPerUnit = item.price - Math.max(0, unitDiscountedPrice);
    return acc + discountPerUnit * item.quantity;
  }, 0);
}

export function calculateDiscountValue(
  subtotal: number,
  catalogDiscount: number,
  discount: number,
  discountType: 'FIXED' | 'PERCENT'
): number {
  const adjustedSubtotal = subtotal - catalogDiscount;
  return discountType === 'PERCENT' ? (adjustedSubtotal * discount) / 100 : discount;
}

export function calculateCouponDiscount(couponApplied: CouponApplied | null): number {
  return couponApplied ? Number(couponApplied.discountAmount || 0) : 0;
}

export function calculateShippingFee(deliveryZone: string): number {
  const zone = DELIVERY_ZONES.find((z) => z.name === deliveryZone);
  return zone ? Number(zone.fee) : 0;
}

export function calculateTax(
  cart: CartItem[],
  subtotal: number,
  catalogDiscount: number,
  discountValue: number,
  couponDiscount: number,
  defaultTaxRate: number
): number {
  return cart.reduce((sum, item) => {
    const rawTax = item.product.taxRate;
    const itemTaxRate = rawTax !== undefined && rawTax !== null && !isNaN(Number(rawTax)) ? Number(rawTax) : defaultTaxRate;

    const totalDiscount = discountValue + couponDiscount;

    const discAmt = Number(item.product.discountAmount || 0);
    const discType = item.product.discountType || 'fixed';
    const unitDiscountedPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;

    const itemSubtotal = Math.max(0, unitDiscountedPrice) * item.quantity;
    const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * totalDiscount : 0;

    const itemTaxableAmount = Math.max(0, itemSubtotal - itemDiscount);
    const itemTax = (itemTaxableAmount * itemTaxRate) / 100;
    return sum + itemTax;
  }, 0);
}
