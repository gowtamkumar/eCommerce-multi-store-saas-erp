import { UserRole } from '@/lib/enums/user-role';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, username, setupKey } = await req.json();

        // Very basic security: check for a secret key from environment or just a hardcoded one for this session
        // In a real app, this should be MUCH more secure.
        if (setupKey !== "super-setup-2026") {
            return NextResponse.json({ error: "Invalid setup key" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const superAdmin = (await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            role: UserRole.SuperAdmin,
        } as any)) as any;

        return NextResponse.json({
            success: true,
            message: "Super Admin created successfully. Please delete this API route for security.",
            user: { name: superAdmin.name, username: superAdmin.username }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
