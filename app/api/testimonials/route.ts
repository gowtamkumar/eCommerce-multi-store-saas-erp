import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
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
    
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
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
    const testimonial = await Testimonial.create({
      ...body,
      tenantId, // Scoped
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
