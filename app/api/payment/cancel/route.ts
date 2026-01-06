import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentStatus } from '@/lib/enums/payment-status';
import dbConnect from '@/lib/mongodb';
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

        // Redirect to Tenant Domain
        const Tenant = (await import('@/models/Tenant')).default;
        const tenant = await Tenant.findById(order.tenantId);
        
        let returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        if (tenant) {
          if (tenant.customDomain) {
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            returnUrl = `${protocol}://${tenant.customDomain}`;
          } else if (tenant.subdomain) {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            returnUrl = `${protocol}://${tenant.subdomain}.${rootDomain}`;
          }
        }
        return NextResponse.redirect(`${returnUrl}/?status=cancel`);
      }
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=cancel`);
  } catch (error) {
    console.error('Payment cancel error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=error`);
  }
}
