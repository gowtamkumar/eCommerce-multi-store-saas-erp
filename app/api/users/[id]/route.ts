import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const { id } = await params;
        const user = await User.findOne({ _id: id, tenantId } as any).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const { id } = await params;
        const body = await req.json();
        
        // Ensure update is scoped to tenant
        const user = await User.findOneAndUpdate({ _id: id, tenantId } as any, body, { new: true }).select('-password');
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }
        
        const { id } = await params;
        const user = await User.findOneAndDelete({ _id: id, tenantId } as any);
        
        if (!user) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
