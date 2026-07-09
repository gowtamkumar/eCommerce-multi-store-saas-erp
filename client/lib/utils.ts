import { Order } from '@/types/order';
import { type ClassValue, clsx } from 'clsx';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { fetchAPI } from '../services/api';
import { OrderStatus } from './enums/order-status.enum';
import { ShippingZoneType } from './enums/shipping-zone-type.enum';
import { DiscountType } from './enums/discount-type.enum';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currencySymbol?: string): string {
  const num = Number(amount) || 0;
  const symbol = currencySymbol || '$';
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculatePricing(price: number, discountAmount: number, discountType: DiscountType | string, taxRate: number) {

  let discountedPrice = price;
  if (discountAmount > 0) {
    if (discountType === DiscountType.PERCENTAGE) {
      discountedPrice = Math.max(0, price * (1 - discountAmount / 100));
    } else {
      discountedPrice = Math.max(0, price - discountAmount);
    }
  }

  const taxAmount = (discountedPrice * taxRate) / 100;
  const finalPrice = discountedPrice + taxAmount;
  return {
    price: +price + Number(taxRate || 0),
    discountAmount,
    discountType,
    taxRate,
    discountedPrice,
    taxAmount,
    finalPrice
  };
}

export function calculateShippingFee(
  shippingZone: ShippingZoneType,
  shippingConfig: any,
  payableSubtotal: number
): number {
  if (!shippingZone) return 0;

  const insideFee = Number(shippingConfig?.insideCityFee ?? 60);
  const outsideFee = Number(shippingConfig?.outsideCityFee ?? 120);
  const threshold = Number(shippingConfig?.freeShippingThreshold ?? 5000);

  const rawShippingFee = shippingZone === ShippingZoneType.INSIDE ? insideFee : outsideFee;
  const isFreeShipping = threshold > 0 && payableSubtotal >= threshold;

  return isFreeShipping ? 0 : rawShippingFee;
}


export const handleCreatePathaoOrder = async (
  order: Order,
  setCreatingPathaoOrder: (orderId: string | null) => void,
  locationData?: { recipient_city?: number; recipient_zone?: number; recipient_area?: number; item_weight?: number }
) => {
  setCreatingPathaoOrder(order.id);

  try {
    const response = await fetchAPI('/courier/pathao/create-order', {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        ...locationData
      }),
    });

    toast.success('Pathao order created successfully!');
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Failed to create Pathao order:', error);
    toast.error(error?.message || 'Failed to create Pathao order. Please check your courier settings.');
    return { success: false, error };
  } finally {
    setCreatingPathaoOrder(null);
  }
};

export const handleCreateSteadfastOrder = async (order: Order, setCreatingOrder: (orderId: string | null) => void) => {
  setCreatingOrder(order.id);
  try {
    // Format phone number to ensure it's 11 digits starting with 0
    let formattedPhone = (order.customerPhone || '').replace(/\D/g, ''); // Remove non-digits

    // Ensure phone starts with 0 and is 11 digits
    if (!formattedPhone.startsWith('0')) {
      formattedPhone = '0' + formattedPhone;
    }
    if (formattedPhone.length > 11) {
      formattedPhone = formattedPhone.slice(0, 11);
    }
    if (formattedPhone.length < 11) {
      // Pad with zeros if too short, or use default
      formattedPhone = '01700000000';
    }

    // Map order data to Steadfast format
    const steadfastOrderData = {
      invoice: order.id.slice(-8).toUpperCase(),
      recipient_name: order.customerName,
      recipient_phone: formattedPhone,
      recipient_address: order.address || 'Address not provided',
      cod_amount: Number(order.totalAmount) || 0, // Ensure it's a number
      item_description: order.items?.map((item: any) =>
        `${item.quantity}x ${item.product?.name || 'Product'}`
      ).join(', ') || 'Order items'
    };

    const response = await fetchAPI('/courier/steadfast/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: order.id }),
    });

    toast.success('Steadfast order created successfully!');
    console.log('Steadfast order response:', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Failed to create Steadfast order:', error);
    toast.error(error?.message || 'Failed to create Steadfast order. Please check your courier settings.');
    return { success: false, error };
  } finally {
    setCreatingOrder(null);
  }
};




export const getOrderStatusStyles = (status: string) => {
  switch (status) {
    case OrderStatus.PROCESSING:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case OrderStatus.CONFIRMED:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case OrderStatus.COMPLETED:
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
};

/**
 * Update order status or other fields via API
 * @param orderId - Order ID to update
 * @param updates - Fields to update (e.g., { status: 'completed', paymentStatus: 'paid' })
 * @returns Updated order data if successful
 */
export const updateOrderStatus = async (orderId: string, updates: Record<string, any>) => {
  try {
    const res = await fetchAPI(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    } else {
      return { success: false, error: 'Failed to update order' };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error updating order' };
  }
};

export const handleManualDispatch = async (order: Order, setUpdating: (orderId: string | null) => void) => {
  setUpdating(order.id);
  try {
    const result = await updateOrderStatus(order.id, {
      courierStatus: 'MANUAL',
      status: OrderStatus.SHIPPED,
      trackingId: 'MANUAL-' + order.id.slice(-6).toUpperCase()
    });

    if (result.success) {
      toast.success('Order marked as manually dispatched!');
      return { success: true };
    } else {
      toast.error(result.error || 'Failed to update order');
      return { success: false };
    }
  } catch (error: any) {
    toast.error(error?.message || 'Error updating order');
    return { success: false };
  } finally {
    setUpdating(null);
  }
};