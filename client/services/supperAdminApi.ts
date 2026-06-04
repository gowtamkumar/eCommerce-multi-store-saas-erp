import nestApiUrl from "../lib/api-url";

export async function fetchSuperAdminAPI(endpoint: string, options: RequestInit = {}) {
  let token: string | undefined;

  if (typeof window === 'undefined') {
    // Server-side
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("../lib/authOptions");
    const session = await getServerSession(authOptions);
    token = session?.user?.accessToken;
  } else {
    // Client-side
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    token = session?.user?.accessToken;
  }

  if (!token) {
    throw new Error("No auth token");
  }

  const headers: any = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // Only set Content-Type if not FormData (to let browser set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }


  const res = await fetch(`${nestApiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(
      error.message || "An error occurred while fetching the data.",
    );
  }

  return res.json();
}

/**
 * Downloads a file (e.g. CSV export) from a Super Admin endpoint.
 *
 * The standard `fetchSuperAdminAPI` helper always parses JSON, which corrupts
 * binary/text-file responses. A plain anchor navigation also fails because the
 * Bearer token lives in the NextAuth session (not a cookie), so the protected
 * route returns 401. This fetches the response as a blob with the auth header
 * attached and triggers a client-side download.
 */
export async function downloadSuperAdminFile(
  endpoint: string,
  fallbackFilename: string,
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("downloadSuperAdminFile can only run in the browser");
  }

  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const token = session?.user?.accessToken;

  if (!token) {
    throw new Error("No auth token");
  }

  const res = await fetch(`${nestApiUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to download file");
  }

  // Prefer the filename advertised by the server, fall back to a sensible name.
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || fallbackFilename;

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
