import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { orderId } = await req.json();

    const Order = (await import("@/models/Order")).default;
    const Product = (await import("@/models/Product")).default; // Ensure Product model is available for population

    // Fetch order scoped to tenant
    const order = await Order.findOne({ _id: orderId, tenantId }).populate("productId");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const product = order.productId as any; // Cast to access name if needed, or use IProduct if imported

    // SSLCommerz Configuration
    const store_id = process.env.STORE_ID || "testbox";
    const store_passwd = process.env.STORE_PASSWORD || "qwerty";
    const is_live = process.env.NODE_ENV === "production"; // Use environment for live mode

    const tran_id = `TRAN_${orderId}_${Date.now()}`;

    // Update order with transaction ID
    order.transactionId = tran_id;
    await order.save();

    const initData = {
      store_id,
      store_passwd,
      total_amount: (order.totalAmount / (order.currencyRate || 1)).toFixed(2),
      currency: order.currency || "BDT",
      tran_id,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success?tran_id=${tran_id}`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/cancel?tran_id=${tran_id}`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: product?.name || "Product",
      product_category: product?.category || "General",
      product_profile: "general",
      cus_name: order.customerName,
      cus_email: order.customerEmail,
      cus_add1: order.address,
      cus_add2: "N/A",
      cus_city: "N/A",
      cus_state: "N/A",
      cus_postcode: "N/A",
      cus_country: "Bangladesh",
      cus_phone: order.customerPhone || "01700000000",
      cus_fax: order.customerPhone || "01700000000",
      ship_name: order.customerName,
      ship_add1: order.address,
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: "N/A",
      ship_country: "Bangladesh",
    };

    const apiUrl = is_live
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    // Form data for SSLCommerz
    const formData = new URLSearchParams();
    Object.entries(initData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "SUCCESS") {
      return NextResponse.json({ gatewayUrl: result.GatewayPageURL });
    } else {
      return NextResponse.json(
        { error: "Failed to initiate payment", details: result.failedreason },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
