import { Order } from '@/types/order';
import { type ClassValue, clsx } from 'clsx';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { fetchAPI } from './api';
import { OrderStatus } from './enums/order-status';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencySymbol?: string): string {
  const symbol = currencySymbol || '$';
  return `${symbol}${amount.toLocaleString()}`;
}




 export const handleCreatePathaoOrder = async (order: Order, setCreatingPathaoOrder: (orderId: string | null) => void) => {
    setCreatingPathaoOrder(order.id);
    
    try {
      // Format phone number for Pathao
      let formattedPhone = (order.customerPhone || '').replace(/\D/g, '');
      if (!formattedPhone.startsWith('0')) {
        formattedPhone = '0' + formattedPhone;
      }
      if (formattedPhone.length > 11) {
        formattedPhone = formattedPhone.slice(0, 11);
      }
      if (formattedPhone.length < 11) {
        formattedPhone = '01700000000';
      }

      // Calculate total item quantity and weight
      const totalQuantity = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1;
      const estimatedWeight = totalQuantity * 0.5; // Estimate 0.5kg per item

      // Map order data to Pathao format
      const pathaoOrderData = {
        store_id: 1, // Default store ID - should be configured in settings
        merchant_order_id: order.id.slice(-8).toUpperCase(),
        recipient_name: order.customerName,
        recipient_phone: formattedPhone,
        recipient_address: order.address || 'Address not provided',
        delivery_type: 48, // 48 for Normal Delivery, 12 for On Demand
        item_type: 2, // 1 for Document, 2 for Parcel
        item_quantity: totalQuantity,
        item_weight: Math.min(estimatedWeight, 10), // Max 10kg
        item_description: order.items?.map((item: any) =>
          `${item.quantity}x ${item.product?.name || 'Product'}`
        ).join(', ') || 'Order items',
        amount_to_collect: Number(order.totalAmount) || 0,
      };

      const response = await fetchAPI('/courier/pathao/create-order', {
        method: 'POST',
        body: JSON.stringify(pathaoOrderData),
      });

      toast.success('Pathao order created successfully!');
      console.log('Pathao order response:', response);
    } catch (error: any) {
      console.error('Failed to create Pathao order:', error);
      toast.error(error?.message || 'Failed to create Pathao order. Please check your courier settings.');
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
          body: JSON.stringify(steadfastOrderData),
        });
  
        toast.success('Steadfast order created successfully!');
        console.log('Steadfast order response:', response);
      } catch (error: any) {
        console.error('Failed to create Steadfast order:', error);
        toast.error(error?.message || 'Failed to create Steadfast order. Please check your courier settings.');
      } finally {
        setCreatingOrder(null);
      }
    };




export const getOrderStatusStyles = (status: string) => {
    switch (status) {
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
      method: 'PUT',
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