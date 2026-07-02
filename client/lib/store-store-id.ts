const STORE_ID_STORAGE_KEY = "store_store_id";

let cachedStoreId: string | null = null;

/** Client-side store id from settings SSR/hydration (used when hostname lookup fails on localhost). */
export function getClientStoreId(): string | null {
  if (cachedStoreId) {
    return cachedStoreId;
  }

  if (typeof window === "undefined") {
    return null;
  }

  cachedStoreId = localStorage.getItem(STORE_ID_STORAGE_KEY);
  return cachedStoreId;
}

export function setClientStoreId(storeId: string | null | undefined): void {
  if (!storeId) {
    return;
  }

  cachedStoreId = storeId;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_ID_STORAGE_KEY, storeId);
  }
}
