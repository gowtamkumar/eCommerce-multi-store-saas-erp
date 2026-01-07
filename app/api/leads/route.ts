import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await req.json();
        const message = await Lead.create({
            ...body,
            tenantId, // Scoped to tenant
        } as any);
        return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const skip = (page - 1) * limit;

        const query: any = { tenantId }; // Scoped
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const [messages, total] = await Promise.all([
            Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Lead.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
    }
}
