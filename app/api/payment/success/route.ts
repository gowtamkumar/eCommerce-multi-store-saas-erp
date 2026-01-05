import dbConnect from '@/lib/mongodb';
import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentMethod } from '@/lib/enums/payment-method';
import { PaymentStatus } from '@/lib/enums/payment-status';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const tran_id = formData.get('tran_id');

    if (!tran_id) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=fail`);
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (order) {
      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.COMPLETED;
      await order.save();

      // Decrement stock on successful payment/completion
      const Product = (await import('@/models/Product')).default;
      await Product.findByIdAndUpdate(
        order.productId,
        { $inc: { stock: -order.quantity } },
        { new: true }
      );

      // Create Payment Record
      const Payment = (await import('@/models/Payment')).default;
      await Payment.create({
        orderId: order._id,
        transactionId: tran_id as string,
        amount: order.totalAmount,
        currency: order.currency, // Assuming BDT for SSLCommerz
        method: PaymentMethod.SSLCOMMERZ,
        status: 'success',
        gatewayResponse: Object.fromEntries(formData),
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=success&orderId=${order._id}`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=fail`);
    }
  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=error`);
  }
}
