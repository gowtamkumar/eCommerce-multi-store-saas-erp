import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        // Fetch the most recently created product that is active and belongs to tenant
        const product = await Product.findOne({ status: "active", tenantId } as any)
            .sort({ createdAt: -1 })
            .lean();

        if (!product) {
            return NextResponse.json({ error: 'No active product found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Failed to fetch latest product:", error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
