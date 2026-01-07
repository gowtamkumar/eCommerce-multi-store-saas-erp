import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { name, email, password, username } = await req.json();

    if (!name || !email || !password || !username) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check for existing user IN THIS TENANT
    const existingUser = await User.findOne({ username, tenantId } as any);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Check email IN THIS TENANT
    const existingEmail = await User.findOne({ email, tenantId } as any);
    if (existingEmail) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      tenantId, // Scoped to tenant
    } as any);

    const createdUser = user as any;

    return NextResponse.json({ success: true, user: { name: createdUser.name, username: createdUser.username, email: createdUser.email } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
