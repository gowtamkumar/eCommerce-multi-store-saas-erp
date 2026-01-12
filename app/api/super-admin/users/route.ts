import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'SuperAdmin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch users and populate tenant info if possible
        // We'll use a lean query and then potentially manually link or use populate if ref is set
        const users = await User.find()
            .populate('tenantId', 'storeName subdomain')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ users });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
