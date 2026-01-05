import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter an username and password");
        }

        await dbConnect();

        // Dynamically import to avoid circular dependency issues if any
        const { getTenantId } = await import("./tenant");
        // req is available if we pass it in route handler.
        // Cast req to Request if needed or just pass it.
        const tenantId = await getTenantId(req as any);

        if (!tenantId) {
          throw new Error("Tenant context missing during login");
        }

        const user = await User.findOne({
          username: credentials.username,
          tenantId
        } as any);

        if (!user) {
          throw new Error("No user found with this username");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username || user.email,
          role: user.role,
          address: user.address || "",
          phone: user.phone || "",
          image: user.image || "",
          tenantId: user.tenantId.toString(),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - session expires after 1 day
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = user.phone;
        token.address = user.address;
        token.image = user.image;
        token.tenantId = user.tenantId;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.phone = token.phone || "";
        session.user.address = token.address || "";
        session.user.image = token.image || "";
        session.user.tenantId = token.tenantId || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  // SECURITY WARNING: Change this secret in production!
  // Generate with: openssl rand -base64 32
  // Add to .env.local: NEXTAUTH_SECRET=<generated-value>
  secret: process.env.NEXTAUTH_SECRET,
};
