import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Filter logic for payments is a bit more complex because accessing customerName requires lookups if not using aggregation
    // For simplicity, we search by Transaction ID or Method directly on Payment
    // To search by Customer Name, we would need an aggregate pipeline with lookup. 
    // Given the constraints and current complexity, I'll restrict search to transaction ID and method for now, 
    // or implement a basic population-based filter if volume is low.
    // Let's use a basic find with regex for fields on the model.
    const query: any = { tenantId }; // Tenant Scoped
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { method: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    // Note: Searching by customer name isn't efficiently supported without aggregation since it's a referenced field.
    // I will stick to fields present on the Payment document.

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'customerName'),
      Payment.countDocuments(query)
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
