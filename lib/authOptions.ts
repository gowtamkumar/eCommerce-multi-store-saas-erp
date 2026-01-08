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

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // 1. Try to get headers from next/headers (most reliable for tenant detection in Next.js 13+)
        try {
          const { headers: nextHeaders } = await import("next/headers");
          const h = await nextHeaders();
          h.forEach((val, key) => {
            headers[key] = val;
          });
          console.log("Headers from next/headers:", headers);
        } catch (e: any) {
          console.log(
            "next/headers not available, falling back to req.headers"
          );
          // Fallback to req.headers if next/headers is not available
          if (req?.headers) {
            if (typeof req.headers.forEach === "function") {
              req.headers.forEach((val: string, key: string) => {
                headers[key] = val;
              });
            } else {
              Object.assign(headers, req.headers);
            }
          }
          console.log("Headers from fallback:", headers);
        }

        // 2. Determine base URL for internal fetch
        const host = headers["host"] || "localhost:3000";
        const proto =
          headers["x-forwarded-proto"] ||
          (host.includes("localhost") ? "http" : "https");
        const apiUrl = `${proto}://${host}/api/auth/verify`;

        console.log("Internal Auth API URL:", apiUrl);

        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            cache: "no-store",
          });

          const data = await res.json();

          if (!res.ok) {
            console.error(
              "Auth verification API error:",
              data.error || res.statusText,
              "Status:",
              res.status
            );
            throw new Error(data.error || "Authentication failed");
          }

          if (data.success && data.user) {
            return data.user;
          }

          throw new Error(data.error || "Authentication failed");
        } catch (error: any) {
          console.error("Authorize internal fetch error:", error.message);
          throw new Error(error.message);
        }
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
