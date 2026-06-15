import nestApiUrl from "../lib/api-url";

export async function publicSaasApi(endpoint: string, options: RequestInit = {}) {

  const headers: any = {
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
