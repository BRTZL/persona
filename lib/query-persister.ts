import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const STORAGE_KEY = "persona-query-cache";
const CACHE_BUSTER = "v1";

export function createPersister() {
  if (typeof window === "undefined") {
    return null;
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
  });
}

export const persistOptions = {
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: CACHE_BUSTER,
};
