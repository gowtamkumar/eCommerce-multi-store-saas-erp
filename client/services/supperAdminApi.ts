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
