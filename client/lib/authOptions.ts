import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchAPI } from "../services/api";
import nestApiUrl from "./api-url";
import { decodeJwtPayload } from "./jwt.util";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        impersonateToken: { label: "Impersonate Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.impersonateToken && (!credentials?.username || !credentials?.password)) {
          throw new Error("Please enter an email/username and password");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // 1. Try to get headers from next/headers (most reliable for store detection in Next.js 13+)
        try {
          const { headers: nextHeaders } = await import("next/headers");
          const h = await nextHeaders();
          h.forEach((val, key) => {
            headers[key] = val;
          });
        } catch (error) {
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
        }

        // Clean up headers to avoid conflicts with fetchAPI's JSON handling
        // We MUST remove 'content-type' (lowercase) because the incoming request likely has
        // 'application/x-www-form-urlencoded' which overrides our 'Content-Type: application/json'
        // when passed to fetch, causing the backend to parse the body incorrectly.
        if (headers["content-type"]) delete headers["content-type"];
        if (headers["content-length"]) delete headers["content-length"];

        // Server-side Store ID Resolution
        if (!headers["x-store-id"] && headers["host"]) {
          const host = headers["host"];
          const parts = host.split(".");
          let queryParams = `?customDomain=${host}`;

          if (parts.length > 1) {
            const subdomain = parts[0];
            // Standard subdomain logic (ignoring www/api/localhost if not subdomained)
            // Fix: Strict check for localhost:3000 to allow subdomains like store.localhost:3000
            if (
              subdomain !== "www" &&
              subdomain !== "api" &&
              host !== "localhost:3000" &&
              host !== "127.0.0.1:3000"
            ) {
              queryParams += `&subdomain=${subdomain}`;

              try {
                // We use fetchAPI to call our own backend
                const storeRes = await fetchAPI(`/stores${queryParams}`, {
                  method: "GET",
                  headers: {}, // Explicitly clear headers to ensure clean request
                });

                if (storeRes.success && storeRes.data?.id) {
                  headers["x-store-id"] = storeRes.data.id;
                }
              } catch (e: any) { }
            } else {
            }
          }
        }

        if (credentials?.impersonateToken) {
          try {
            const data = await fetchAPI("/admin/login-impersonated", {
              method: "POST",
              headers,
              body: JSON.stringify({
                impersonateToken: credentials.impersonateToken,
              }),
            });

            if (data.success && data.data && data.data.user) {
              const user = data.data.user;
              user.accessToken = data.data.accessToken;
              user.refreshToken = data.data.refreshToken;
              user.accessTokenExpires = Math.floor(Date.now() / 1000) + 900;
              return user;
            }
            throw new Error(data.message || "Impersonation login failed");
          } catch (error: any) {
            console.error("Authorize impersonation error:", error.message);
            throw new Error(error.message || "Impersonation failed");
          }
        }

        try {
          const data = await fetchAPI("/admin/login", {
            method: "POST",
            headers,
            body: JSON.stringify({
              usernameOrEmail: credentials.username,
              password: credentials.password,
            }),
          });

          if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            user.accessToken = data.data.accessToken;
            user.refreshToken = data.data.refreshToken;
            user.permissionManifest = data.data.permissionManifest ?? null;
            // Set expiry to 15 minutes from now (in seconds)
            user.accessTokenExpires = Math.floor(Date.now() / 1000) + 900;
            return user;
          }

          throw new Error(data.message || "Authentication failed");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          console.error("Authorize internal fetch error:", errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - session expires after 7 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          phone: user.phone,
          address: user.address,
          image: user.image,
          storeId: user.storeId,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          features: user.features || [],
          permissionManifest: user.permissionManifest ?? null,
        };
      }

      if (trigger === "update" && session) {
        return {
          ...token,
          ...session,
          features: session.features ?? token.features ?? [],
          permissionManifest:
            session.permissionManifest ?? token.permissionManifest ?? null,
        };
      }
      // If token is not expired, return it
      if (
        token.accessTokenExpires &&
        Date.now() / 1000 < token.accessTokenExpires
      ) {
        return token;
      }

      // Token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.image = token.image;
        session.user.storeId = token.storeId;
        session.user.accessToken = token.accessToken;
        session.user.error = token.error;
        session.user.features = token.features || [];
        session.user.permissionManifest = token.permissionManifest ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs to preserve current subdomain
      if (url.startsWith("/")) return url;
      // Allows callback URLs on the same origin (including subdomains)
      else if (
        url.includes("localhost") ||
        url.includes(".com") ||
        url.includes(".net")
      )
        return url;
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

let refreshInFlight: Promise<Record<string, unknown>> | null = null;
let refreshBlockedUntil = 0;

async function refreshAccessToken(token: any) {
  if (Date.now() < refreshBlockedUntil) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${nestApiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: token.id,
          refreshToken: token.refreshToken,
        }),
      });

      const refreshedTokens = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          refreshBlockedUntil = Date.now() + 60_000;
        }
        throw refreshedTokens;
      }

      const accessToken = refreshedTokens.data.accessToken as string;
      const payload = decodeJwtPayload<{ features?: string[] }>(accessToken);

      let permissionManifest = token.permissionManifest ?? null;
      let features = payload?.features ?? token.features ?? [];
      try {
        const meRes = await fetch(`${nestApiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const meBody = await meRes.json();
          permissionManifest = meBody?.data?.permissionManifest ?? permissionManifest;
          features =
            meBody?.data?.user?.features ??
            permissionManifest?.featuresEnabled ??
            features;
        }
      } catch {
        /* keep cached manifest on refresh failure */
      }

      return {
        ...token,
        accessToken,
        refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken,
        accessTokenExpires: Math.floor(Date.now() / 1000) + 900,
        features,
        permissionManifest,
        error: undefined,
      };
    } catch (error) {
      console.error("RefreshAccessTokenError", error);

      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
