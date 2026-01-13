export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
import { getSession } from "next-auth/react";

import { getTenantId } from "./tenant";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: any = { ...options.headers };

  // If tenant ID not provided in headers, try to resolve it
  if (!headers["x-tenant-id"]) {
    const resolvedId = await getTenantId();
    console.log("resolvedId", resolvedId);

    if (resolvedId) {
      headers["x-tenant-id"] = resolvedId;
    }
  }

  if (!(options.body instanceof FormData)) {
    (headers as any)["Content-Type"] = "application/json";
  }

  // Automatically inject access token
  if (!(headers as any)["Authorization"]) {
    try {
      if (typeof window !== "undefined") {
        // Client-side
        const session = await getSession();
        if (session?.user?.accessToken) {
          (headers as any)["Authorization"] = `Bearer ${session.user.accessToken}`;
        }
      } else {
        // Server-side
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("./authOptions");
        const session = await getServerSession(authOptions);
        if (session?.user?.accessToken) {
          (headers as any)["Authorization"] = `Bearer ${session.user.accessToken}`;
        }
      }
    } catch (e) {
      // Ignore session errors
      console.error("fetchAPI: Session injection failed", e);
    }
  }
  console.log("`${API_URL}${endpoint}`", `${API_URL}${endpoint}`);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "An error occurred" }));

    // Handle session expiry gracefully
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        const { signOut } = await import("next-auth/react");
         // Only sign out if we are not already on the login page to avoid loops
         if (!window.location.pathname.includes('/login')) {
            console.warn("Session expired (401), signing out...");
            await signOut({ callbackUrl: "/login" });
            return; // Stop execution after sign out
         }
      }
    }

    throw new Error(
      error.message || "An error occurred while fetching the data."
    );
  }

  return res.json();
}
