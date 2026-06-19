// Use internal Docker service name for server-side, public URL for client-side

import { getSession } from "next-auth/react";
import nestApiUrl from "../lib/api-url";
import { getClientTenantId } from "../lib/store-tenant-id";
import { getTenantId } from "./tenant";
import { authOptions } from "@/lib/authOptions";

type FetchAPIOptions = RequestInit & {
  tenantId?: string;
  silent404?: boolean;
};

export async function fetchAPI(endpoint: string, options: FetchAPIOptions = {}) {
  const { tenantId: explicitTenantId, silent404, ...fetchOptions } = options;
  const headers: any = { ...fetchOptions.headers };
  // If tenant ID not provided in headers, try to resolve it
  if (!headers["x-tenant-id"]) {
    if (explicitTenantId) {
      headers["x-tenant-id"] = explicitTenantId;
    } else {
      const resolvedId = await getTenantId(null, true);

      if (resolvedId) {
        headers["x-tenant-id"] = resolvedId;
      } else if (typeof window !== "undefined") {
        const clientTenantId = getClientTenantId();
        if (clientTenantId) {
          headers["x-tenant-id"] = clientTenantId;
        }
      }
    }
  }

  // Automatically inject active branch ID from localStorage on client-side
  if (typeof window !== "undefined" && !headers["x-branch-id"]) {
    const activeBranchId = localStorage.getItem("activeBranchId");
    if (activeBranchId) {
      headers["x-branch-id"] = activeBranchId;
    }
  }

  if (!(fetchOptions.body instanceof FormData)) {
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
        // const { authOptions } = await import("../lib/authOptions");
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
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    if (res.status === 404 && silent404) {
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

    const errMsg = Array.isArray(error.message)
      ? error.message.join(", ")
      : typeof error.message === "string"
        ? error.message
        : "An error occurred while fetching the data.";

    throw new Error(errMsg);
  }

  return await res.json();
}
