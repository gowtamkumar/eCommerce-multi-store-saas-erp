import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchAPI } from "./api";

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

        const host = headers["host"] || "localhost:3000";
        // const proto = headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");

        // Use local NestJS instance for server-side auth
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
        const loginUrl = `/admin/login`; // Assuming universal login endpoint

        console.log("External Auth API URL:", loginUrl);

        console.log("Internal Auth API URL:", apiUrl);

        try {
          const res = await fetchAPI(loginUrl, {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          console.log("data", data);

          if (!res.ok) {
            console.error(
              "Auth verification API error:",
              data.error || res.statusText,
              "Status:",
              res.status
            );
            throw new Error(data.error || "Authentication failed");
          }

          if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            // Inject accessToken into user object
            user.accessToken = data.data.token;
            return user;
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
        token.accessToken = user.accessToken;
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
        session.user.accessToken = token.accessToken;
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
