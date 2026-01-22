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
        console.log("[Auth] Authorize called with credentials:", JSON.stringify(credentials));
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
        } catch (error) {
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

        // Clean up headers to avoid conflicts with fetchAPI's JSON handling
        // We MUST remove 'content-type' (lowercase) because the incoming request likely has
        // 'application/x-www-form-urlencoded' which overrides our 'Content-Type: application/json'
        // when passed to fetch, causing the backend to parse the body incorrectly.
        if (headers['content-type']) delete headers['content-type'];
        if (headers['content-length']) delete headers['content-length'];

        // Server-side Tenant ID Resolution
        if (!headers['x-tenant-id'] && headers['host']) {
          const host = headers['host'];
          console.log(`[Auth] Resolving tenant for host: ${host}`);

          const parts = host.split('.');
          let queryParams = `?customDomain=${host}`;

          if (parts.length > 1) {
            const subdomain = parts[0];
            // Standard subdomain logic (ignoring www/api/localhost if not subdomained)
            // Fix: Strict check for localhost:3000 to allow subdomains like store.localhost:3000
            if (subdomain !== 'www' && subdomain !== 'api' && host !== 'localhost:3000' && host !== '127.0.0.1:3000') {
              queryParams += `&subdomain=${subdomain}`;

              try {
                console.log(`[Auth] Fetching tenant info: /tenants${queryParams}`);
                // We use fetchAPI to call our own backend
                const tenantRes = await fetchAPI(`/tenants${queryParams}`, {
                  method: 'GET',
                  headers: {}, // Explicitly clear headers to ensure clean request
                });

                console.log(`[Auth] Tenant Resolution Response:`, JSON.stringify(tenantRes));

                if (tenantRes.success && tenantRes.data?.id) {
                  console.log(`[Auth] Resolved tenant ID: ${tenantRes.data.id}`);
                  headers['x-tenant-id'] = tenantRes.data.id;
                } else {
                  console.warn(`[Auth] Failed to find tenant ID in response data`);
                }
              } catch (e: any) {
                console.error('[Auth] Failed to resolve tenant server-side:', e.message || e);
              }
            } else {
              console.log(`[Auth] Skipping subdomain resolution for: ${subdomain}`);
            }
          }
        } else {
          console.log(`[Auth] existing headers: x-tenant-id=${headers['x-tenant-id']}, host=${headers['host']}`);
        }

        try {
          console.log(`[Auth] Attempting login to /admin/login with headers:`, JSON.stringify(headers));
          const data = await fetchAPI('/admin/login', {
            method: "POST",
            headers,
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          console.log("data", data);

          if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            // Inject accessToken into user object
            user.accessToken = data.data.token;
            return user;
          }

          throw new Error(data.message || "Authentication failed");
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          console.error("Authorize internal fetch error:", errorMessage);
          throw new Error(errorMessage);
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
        token.role = user.role;
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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${new URL(url, baseUrl).origin}${url}`;
      // Allows callback URLs on the same origin (including subdomains)
      else if (new URL(url).origin === new URL(baseUrl).origin || url.includes('localhost')) return url;
      return baseUrl;
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
