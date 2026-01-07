import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
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
    const testimonial = await Testimonial.findOneAndUpdate({ _id: id, tenantId } as any, body, { new: true });
    
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
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
    const testimonial = await Testimonial.findOneAndDelete({ _id: id, tenantId } as any);

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
