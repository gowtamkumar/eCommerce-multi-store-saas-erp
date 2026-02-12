import nestApiUrl from "../lib/api-url";

export async function fetchSuperAdminAPI(endpoint: string, options: RequestInit = {}) {
  // Server-side auth token retrieval
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../lib/authOptions");
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    throw new Error("No auth token");
  }

  const headers: any = {
    'Authorization': `Bearer ${session.user.accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
