import dbConnect from '@/lib/mongodb';
import { getTenantId } from '@/lib/tenant';
import Page from '@/models/Page';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = { tenantId }; // Scoped
    if (status) query.status = status;
    
    const pages = await Page.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pages' }, { status: 500 });
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

    const page = await Page.create({
      ...body,
      tenantId, // Scoped
    });
    console.log('Page created successfully:', page);
    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create page:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create page' }, { status: 500 });
  }
}
