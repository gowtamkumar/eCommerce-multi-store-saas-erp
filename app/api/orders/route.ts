import { OrderStatus } from "@/lib/enums/order-status";
import { PaymentStatus } from "@/lib/enums/payment-status";
import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import Lead from "@/models/Lead";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);


    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const SiteSettings = (await import("@/models/SiteSettings")).default;
    const settings = await SiteSettings.findOne({ tenantId });

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      productId,
      quantity,
      paymentMethod,
      orderNotes,
      currency,
      currencyRate,
    } = body;

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const product = await Product.findOne({ _id: productId, tenantId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Only ${product.stock} items available.`,
        },
        { status: 400 }
      );
    }

    // Lead Capture Logic: Find or create a user scoped to tenant
    const user = await User.findOne({ email: customerEmail, tenantId: tenantId } as any);

    if (!user) {
      // Create a lead user if not found
      await Lead.create({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: address,
        subject: "New lead from order",
        message: "New lead from order",
        tenantId, // Scoped to tenant
      });
    }

    const unitPrice = product.price;
    const discountAmount = product.discountAmount || 0;
    const totalAmount = (unitPrice - discountAmount) * quantity;

    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      address,
      productId,
      quantity,
      unitPrice,
      discountAmount,
      totalAmount,
      currency: currency || settings?.currency || "USD",
      currencyRate: currencyRate || 1,
      paymentMethod,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      orderNotes,
      userId: user?._id,
      tenantId, // Scoped to tenant
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const query: any = { tenantId }; // Scoped query
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        // { _id: { $regex: search, $options: "i" } }, // Removed incorrect regex on ObjectId if strictly typed
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("productId"),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
