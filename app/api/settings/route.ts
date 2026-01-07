import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        // Find the settings document for this tenant, or create default if none exists
        let settings = await SiteSettings.findOne({ tenantId });

        if (!settings) {
            settings = await SiteSettings.create({ tenantId });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await req.json();

        // Update the document for this tenant
        // upsert: true ensures it's created if it doesn't exist
        const settings = await SiteSettings.findOneAndUpdate(
            { tenantId } as any, 
            { ...body, tenantId }, // Ensure tenantId is preserved/set
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
}
