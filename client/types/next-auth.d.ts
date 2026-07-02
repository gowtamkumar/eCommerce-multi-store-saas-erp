import { UserRole } from "@/lib/enums/user-role.enum";
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
    role: UserRole;
    storeId: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    features: string[];
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
      role: UserRole;
      storeId: string;
      accessToken?: string;
      refreshToken?: string;
      accessTokenExpires?: number;
      error?: string;
      features: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    phone?: string;
    address?: string;
    image?: string;
    storeId?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    features: string[];
  }
}
