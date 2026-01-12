import { OrderStatus } from '@/lib/enums/order-status';
import { PaymentMethod } from '@/lib/enums/payment-method';
import { PaymentStatus } from '@/lib/enums/payment-status';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const tran_id = formData.get('tran_id');

    const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!tran_id) {
      return NextResponse.redirect(`${fallbackUrl}/?status=fail`);
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
        orderId: order.id,
        transactionId: tran_id as string,
        amount: order.totalAmount,
        currency: order.currency,
        method: PaymentMethod.SSLCOMMERZ,
        status: 'success',
        gatewayResponse: Object.fromEntries(formData),
        tenantId: order.tenantId, // Add tenantId from order
      });

      // Redirect to Tenant Domain
      const Tenant = (await import('@/models/Tenant')).default;
      const tenant = await Tenant.findById(order.tenantId);

      console.log('Payment Success - TenantId:', order.tenantId, 'Tenant:', tenant?.subdomain || tenant?.customDomain);

      let returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      if (tenant) {
        if (tenant.customDomain) {
          const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
          returnUrl = `${protocol}://${tenant.customDomain}`;
        } else if (tenant.subdomain) {
          // Use ROOT_DOMAIN for subdomain construction
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
          const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
          returnUrl = `${protocol}://${tenant.subdomain}.${rootDomain}`;
        }
      }

      console.log('Payment Success - Redirecting to:', returnUrl);

      return NextResponse.redirect(`${returnUrl}/?status=success&orderId=${order.id}`);
    } else {
      return NextResponse.redirect(`${fallbackUrl}/?status=fail`);
    }
  } catch (error) {
    console.error('Payment success error:', error);
    const fallback = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${fallback}/?status=error`);
  }
}
