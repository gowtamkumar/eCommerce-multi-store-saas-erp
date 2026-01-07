import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

import { getTenantId } from "@/app/api/utils/getTenantId";
import { OrderStatus } from "@/lib/enums/order-status";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { PaymentStatus } from "@/lib/enums/payment-status";
import Payment from "@/models/Payment";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { status, paymentStatus, transactionId } = await req.json();

    // Get the current order before updating to check previous status
    const currentOrder = await Order.findOne({ _id: id, tenantId } as any).populate("productId");
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (transactionId !== undefined) updateData.transactionId = transactionId;

    const order = await Order.findOneAndUpdate({ _id: id, tenantId } as any, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If payment status is updated to 'paid' and it's a COD order, create a Payment record
    if (
      paymentStatus === PaymentStatus.PAID &&
      order.paymentMethod === PaymentMethod.COD
    ) {
      // Check if payment already exists to avoid duplicates
      const existingPayment = await Payment.findOne({ orderId: order._id, tenantId } as any);

      if (!existingPayment) {
        await Payment.create({
          orderId: order._id,
          transactionId: transactionId || `COD-${Date.now()}`,
          amount: order.totalAmount,
          currency: order.currency, // Default currency
          method: PaymentMethod.COD,
          status: PaymentStatus.COMPLETED,
          gatewayResponse: {
            manual: true,
            note: "Created via Admin Dashboard",
          },
          tenantId, // Scoped to tenant
        } as any);
      }
    }

    // Manage stock on status change: Deduct on Completion
    if (
      status === OrderStatus.COMPLETED &&
      currentOrder.status !== OrderStatus.COMPLETED
    ) {
      const Product = (await import("@/models/Product")).default;
      await Product.findOneAndUpdate(
        { _id: order.productId, tenantId } as any,
        { $inc: { stock: -order.quantity } },
        { new: true }
      );
    }

    // Restore stock if a COMPLETED order is CANCELLED
    if (
      status === OrderStatus.CANCELLED &&
      currentOrder.status === OrderStatus.COMPLETED
    ) {
      const Product = (await import("@/models/Product")).default;
      await Product.findOneAndUpdate(
        { _id: order.productId, tenantId } as any,
        { $inc: { stock: order.quantity } },
        { new: true }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PUT order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: id, tenantId } as any).populate("productId");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
