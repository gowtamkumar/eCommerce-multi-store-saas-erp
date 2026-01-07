import { getTenantId } from "@/app/api/utils/getTenantId";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        // Fetch orders for the logged-in user by email, scoped to tenant
        const orders = await Order.find({ customerEmail: session.user.email, tenantId } as any)
            .sort({ createdAt: -1 })
            .populate('productId', 'name price images');

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
