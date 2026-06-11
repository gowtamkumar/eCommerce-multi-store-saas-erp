import type { NextConfig } from "next";

// Build the image remote-pattern allowlist. We intentionally avoid a blanket
// `hostname: "*"` (which lets the Next image optimizer proxy arbitrary remote
// hosts — a security and cost risk). Instead we allow:
//   - a small set of known static/CDN hosts,
//   - hosts derived from our own API/app URLs (so MinIO/API-served images work),
//   - any extra hosts listed in NEXT_PUBLIC_IMAGE_HOSTS (comma-separated).
type RemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};

const staticRemotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "cdn-icons-png.flaticon.com", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
  { protocol: "https", hostname: "randomuser.me", pathname: "/**" },
  { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
  { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
];

function patternFromUrl(rawUrl?: string): RemotePattern | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const envHostPatterns: RemotePattern[] = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)
  .map((hostname) => ({ hostname, pathname: "/**" }));

const derivedPatterns = [
  patternFromUrl(process.env.NEXT_PUBLIC_API_URL),
  patternFromUrl(process.env.NEXT_PUBLIC_APP_URL),
].filter((p): p is RemotePattern => p !== null);

const remotePatterns: RemotePattern[] = [
  ...staticRemotePatterns,
  ...derivedPatterns,
  ...envHostPatterns,
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // output: "standalone", // Enable for minimal Docker production images.

  images: {
    remotePatterns,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
