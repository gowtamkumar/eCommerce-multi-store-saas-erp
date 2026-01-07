import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
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
        const query = searchParams.get('q');
        const skip = (page - 1) * limit;

        let filter: any = { tenantId }; // Tenant scoped
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await req.json();
        const { name, email, password, role, username } = body;

        // Check if user exists IN THIS TENANT
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }],
            tenantId 
        } as any);

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            role: role || 'user',
            tenantId // Scoped to tenant
        } as any);

        // Remove password from response
        const userObj = (user as any).toObject();
        delete userObj.password;

        return NextResponse.json({ user: userObj }, { status: 201 });

    } catch (error: any) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}
