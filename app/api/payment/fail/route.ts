import dbConnect from '@/lib/mongodb';
import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentStatus } from '@/lib/enums/payment-status';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const tran_id = formData.get('tran_id');

    if (tran_id) {
      const order = await Order.findOne({ transactionId: tran_id });
      if (order) {
        order.paymentStatus = PaymentStatus.FAILED;
        order.status = OrderStatus.CANCELLED;
        await order.save();
      }
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=fail`);
  } catch (error) {
    console.error('Payment fail error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=error`);
  }
}
