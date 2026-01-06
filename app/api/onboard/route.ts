import { UserRole } from '@/lib/enums/user-role';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import Tenant from '@/models/Tenant';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { storeName, subdomain, name, email, password, username } = body;

        // 1. Basic Validation
        if (!storeName || !subdomain || !name || !email || !password || !username) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // 2. Check Subdomain Availability
        const existingTenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
        if (existingTenant) {
            return NextResponse.json({ error: "Store URL (subdomain) is already taken" }, { status: 400 });
        }

        // 3. Create Tenant
        const tenant = await Tenant.create({
            storeName,
            subdomain: subdomain.toLowerCase(),
            planTier: 'basic',
        });

        // 4. Create Admin User for the Tenant
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            role: UserRole.ADMIN,
            tenantId: tenant._id,
        } as any);

        // 5. Initialize Site Settings
        await SiteSettings.create({
            tenantId: tenant._id,
            brandName: storeName,
            siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
            contactEmail: email,
            logo: "",
            socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
            marketing: {
                googleAnalyticsId: "",
                googleSiteVerification: "",
                facebookPixelId: "",
                facebookDomainVerification: ""
            }
        });

        return NextResponse.json({
            success: true,
            message: "Store created successfully",
            subdomain: tenant.subdomain
        }, { status: 201 });

    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json({ error: error.message || "Onboarding failed" }, { status: 500 });
    }
}
