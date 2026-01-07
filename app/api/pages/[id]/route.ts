import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { id } = await params;
    const page = await Page.findOne({ _id: id, tenantId });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { id } = await params;
    const body = await req.json();

    const page = await Page.findOneAndUpdate({ _id: id, tenantId } as any, body, { new: true });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    console.log('Page updated successfully:', page);
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Failed to update page:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update page' }, { status: 500 });
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
    const page = await Page.findOneAndDelete({ _id: id, tenantId } as any);

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete page' }, { status: 500 });
  }
}
