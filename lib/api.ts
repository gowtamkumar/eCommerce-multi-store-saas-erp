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
  console.log("`${API_URL}${endpoint}`", `${API_URL}${endpoint}`);

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
