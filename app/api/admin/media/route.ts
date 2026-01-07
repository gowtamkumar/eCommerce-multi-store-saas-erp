import { getTenantId } from "@/app/api/utils/getTenantId";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { mkdir, writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const query: any = { tenantId }; // Tenant scoped
        if (search) {
            query.filename = { $regex: search, $options: 'i' };
        }

        const [media, total] = await Promise.all([
            Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Media.countDocuments(query)
        ]);

        return NextResponse.json({
            media,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/\s+/g, '-').toLowerCase();
        const uniqueFilename = `${uuidv4()}-${filename}`;

        // Ensure uploads directory exists
        // Ideally, we should partition by tenant, e.g., public/uploads/{tenantId}
        // But for backward compatibility with simple setups, we'll iterate with valid tenant scoping in DB.
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        const filePath = path.join(uploadDir, uniqueFilename);
        await writeFile(filePath, buffer);

        const newMedia = await Media.create({
            filename: uniqueFilename,
            url: `/uploads/${uniqueFilename}`,
            mimetype: file.type,
            size: file.size,
            tenantId, // Scoped
        });

        return NextResponse.json(newMedia, { status: 201 });
    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
