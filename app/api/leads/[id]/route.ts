import { getTenantId } from "@/app/api/utils/getTenantId";
import { LeadStatus } from '@/lib/enums/lead-status';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const tenantId = await getTenantId(req);

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        console.log("body", body);


        if (!status || !Object.values(LeadStatus).includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        const lead = await Lead.findOneAndUpdate(
            { _id: id, tenantId } as any,
            { status },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return NextResponse.json(
                { success: false, error: 'Lead not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: lead });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update lead status' },
            { status: 500 }
        );
    }
}
