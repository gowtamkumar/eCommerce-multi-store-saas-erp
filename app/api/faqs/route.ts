import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
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

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch FAQs' }, { status: 500 });
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
    const faq = await FAQ.create({
      ...body,
      tenantId, // Scoped
    });
    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error('Failed to create FAQ:', error);
    return NextResponse.json({ success: false, error: 'Failed to create FAQ' }, { status: 500 });
  }
}
