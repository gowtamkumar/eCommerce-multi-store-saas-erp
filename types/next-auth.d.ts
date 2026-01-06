import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    address: string;
    phone: string;
    image: string;
    role: "super_admin" | "admin" | "user";
    tenantId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      address: string;
      phone: string;
      image: string;
      role: "super_admin" | "admin" | "user";
      tenantId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "super_admin" | "admin" | "user";
    phone?: string;
    address?: string;
    image?: string;
    tenantId?: string;
  }
}
