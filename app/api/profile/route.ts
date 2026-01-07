import { getTenantId } from "@/app/api/utils/getTenantId";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        // Ensure user search is scoped to tenant (though ID should be unique enough, extra safety)
        const user = await User.findOne({ _id: session.user.id, tenantId } as any).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await req.json();
        const { name, email, phone, address, image } = body;

        console.log("session", session);


        const user = await User.findOneAndUpdate(
            { _id: session.user.id, tenantId } as any,
            { name, email, phone, address, image },
            { new: true }
        ).select('-password');

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        const user = await User.findOne({ _id: session.user.id, tenantId } as any);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
