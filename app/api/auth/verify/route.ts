import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    await dbConnect();
    const tenantId = await getTenantId(req);

    // If no tenantId, check if it's a Super Admin on the root domain
    if (!tenantId) {
      const user = await User.findOne({ 
        username: username,
        role: "super_admin" 
      });

      if (!user) {
        return NextResponse.json({ error: "Access denied. Root login is only for Super Admins." }, { status: 403 });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
         return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username || user.email,
            role: user.role,
            address: user.address || "",
            phone: user.phone || "",
            image: user.image || "",
            tenantId: "", // Super Admin has no tenantId
        }
      });
    }

    // Standard tenant user login
    const user = await User.findOne({
      username: username,
      tenantId
    });

    if (!user) {
      return NextResponse.json({ error: "No user found with this username in this store." }, { status: 404 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username || user.email,
          role: user.role,
          address: user.address || "",
          phone: user.phone || "",
          image: user.image || "",
          tenantId: user.tenantId.toString(),
      }
    });

  } catch (error: any) {
    console.error("Auth verification failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
