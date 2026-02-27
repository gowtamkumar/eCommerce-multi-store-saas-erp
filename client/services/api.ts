// Use internal Docker service name for server-side, public URL for client-side

import { getSession } from "next-auth/react";
import nestApiUrl from "../lib/api-url";
import { getTenantId } from "./tenant";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: any = { ...options.headers };
  // If tenant ID not provided in headers, try to resolve it
  if (!headers["x-tenant-id"]) {
    const resolvedId = await getTenantId();

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
          (headers as any)["Authorization"] =
            `Bearer ${session.user.accessToken}`;
        }
      } else {
        // Server-side
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("../lib/authOptions");
        const session = await getServerSession(authOptions);
        if (session?.user?.accessToken) {
          (headers as any)["Authorization"] =
            `Bearer ${session.user.accessToken}`;
        }
      }
    } catch (e) {
      // Ignore session errors
      console.error("fetchAPI: Session injection failed", e);
    }
  }

  const res = await fetch(`${nestApiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 404 && (options as any).silent404) {
      return { success: false, data: null, message: "Not found" };
    }

    const error = await res
      .json()
      .catch(() => ({ message: "An error occurred" }));

    // Handle session expiry or refresh errors gracefully
    if (
      res.status === 401 ||
      (typeof window !== "undefined" &&
        (await getSession())?.user?.error === "RefreshAccessTokenError")
    ) {
      if (typeof window !== "undefined") {
        const { signOut } = await import("next-auth/react");
        const pathname = window.location.pathname;

        // Only sign out and redirect if we are on a protected route
        const isProtectedRoute =
          pathname.startsWith("/admin") || pathname.startsWith("/profile");

        if (isProtectedRoute && !pathname.includes("/login")) {
          await signOut({ callbackUrl: `${window.location.origin}/login` });
          return; // Stop execution after sign out
        } else {
          console.warn(
            "Unauthorized API call on public route or already on login page. Skipping redirect.",
          );
        }
      }
    }

    throw new Error(
      error.message || "An error occurred while fetching the data.",
    );
  }

  return await res.json();
}
