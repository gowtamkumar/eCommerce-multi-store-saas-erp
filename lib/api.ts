export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
import { getSession } from "next-auth/react";

let cachedTenantId: string | null = null;

async function getResolvedTenantId() {
  if (cachedTenantId) return cachedTenantId;

  // On client side, we can resolve via hostname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Don't lookup for localhost directly without subdomain unless it's a known tenant
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // For local dev, we might still want a default or rely on headers
      return null;
    }

    try {
      const parts = hostname.split(".");
      let queryParams = `?customDomain=${hostname}`;
      if (parts.length > 1) {
        const subdomain = parts[0];
        if (subdomain !== "www" && subdomain !== "api") {
          queryParams += `&subdomain=${subdomain}`;
        }
      }

      const res = await fetch(`${API_URL}/tenants${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.id) {
          cachedTenantId = data.data.id;
          return cachedTenantId;
        }
      }
    } catch (e) {
      console.error("Failed to resolve tenant client-side", e);
    }
  }
  return null;
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: any = { ...options.headers };

  // If tenant ID not provided in headers, try to resolve it
  if (!headers["x-tenant-id"]) {
    const resolvedId = await getResolvedTenantId();
    console.log("resolvedId", resolvedId);

    if (resolvedId) {
      headers["x-tenant-id"] = resolvedId;
    }
  }

  if (!(options.body instanceof FormData)) {
    (headers as any)["Content-Type"] = "application/json";
  }

  // Automatically inject access token on client-side requests
  if (typeof window !== "undefined" && !(headers as any)["Authorization"]) {
    try {
      const session = await getSession();
      if (session?.user?.accessToken) {
        (headers as any)[
          "Authorization"
        ] = `Bearer ${session.user.accessToken}`;
      }
    } catch (e) {
      // Ignore session errors
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(
      error.message || "An error occurred while fetching the data."
    );
  }

  return res.json();
}
