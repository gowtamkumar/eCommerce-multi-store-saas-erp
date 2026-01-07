import { getTenantId } from "@/app/api/utils/getTenantId";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { unlink } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        await dbConnect();
        const tenantId = await getTenantId(request);
        if (!tenantId) {
             return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });
        }

        const { id } = await params;
        const media = await Media.findOne({ _id: id, tenantId } as any);

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'public', media.url);
        try {
            await unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
            // Continue to delete from DB even if file delete fails (e.g. file missing)
        }

        await Media.findOneAndDelete({ _id: id, tenantId } as any);

        return NextResponse.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
