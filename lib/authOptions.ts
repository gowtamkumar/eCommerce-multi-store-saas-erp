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

        // Construct full URL for the internal API call
        // Note: In NextAuth logic on server, we might process request.
        // We need headers to pass context (tenant)
        
        let headers: Record<string, string> = {
            "Content-Type": "application/json"
        };
        
        // Try to forward headers if available in req setup
        if (req?.headers) {
             // If it's a Headers object
             if (typeof req.headers.forEach === 'function') {
                 req.headers.forEach((val: string, key: string) => {
                     headers[key] = val;
                 });
             } else {
                 // If standard object
                 Object.assign(headers, req.headers);
             }
        } else {
            // Fallback: Use next/headers if possible (usually works in App Router)
             try {
                 const { headers: nextHeaders } = await import("next/headers");
                 const h = await nextHeaders();
                 h.forEach((val, key) => {
                     headers[key] = val;
                 });
             } catch (e) {
                 // ignore
             }
        }

        // Determine host for fetch
        const host = headers["host"] || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const apiUrl = `${protocol}://${host}/api/auth/verify`;

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                }),
                cache: 'no-store'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            if (data.success && data.user) {
                return data.user;
            }

            throw new Error(data.error || "Authentication failed");

        } catch (error: any) {
            console.error("Authorize error:", error);
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
