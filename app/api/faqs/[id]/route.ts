import dbConnect from '@/lib/mongodb';
import { getTenantId } from '@/lib/tenant';
import FAQ from '@/models/FAQ';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { id } = await params;
    const body = await req.json();
    const faq = await FAQ.findOneAndUpdate({ _id: id, tenantId } as any, body, { new: true });
    
    if (!faq) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error('Failed to update FAQ:', error);
    return NextResponse.json({ success: false, error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { id } = await params;
    const faq = await FAQ.findOneAndDelete({ _id: id, tenantId } as any);

    if (!faq) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Failed to delete FAQ:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
