import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Tenant from "@/models/Tenant";
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

        const [tenantCount, userCount, productCount, orderCount, reviewCount] = await Promise.all([
            Tenant.countDocuments(),
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Review.countDocuments(),
        ]);

        return NextResponse.json({
            health: {
                status: "Operational",
                uptime: process.uptime(),
                version: "1.0.0",
                database: "Connected"
            },
            stats: {
                tenants: tenantCount,
                users: userCount,
                products: productCount,
                orders: orderCount,
                reviews: reviewCount
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
