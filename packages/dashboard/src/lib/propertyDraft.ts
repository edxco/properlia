const DB_NAME = "properlia-dashboard";
const STORE = "property-drafts";
const TEXT_KEY_PREFIX = "properlia:property-draft:";

export interface PropertyDraftMedia {
  images: File[];
  videos: File[];
}

export interface PropertyDraft<T> extends PropertyDraftMedia {
  fields: T;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<R>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<R>
): Promise<R> {
  const db = await openDb();
  try {
    return await new Promise<R>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

const textKey = (userId: string) => `${TEXT_KEY_PREFIX}${userId}`;

export async function saveDraft<T>(
  userId: string,
  fields: T,
  media: PropertyDraftMedia
): Promise<void> {
  try {
    localStorage.setItem(textKey(userId), JSON.stringify(fields));
  } catch {}
  try {
    await withStore("readwrite", (store) => store.put(media, userId));
  } catch {}
}

export async function loadDraft<T>(
  userId: string
): Promise<PropertyDraft<T> | null> {
  let fields: T | null = null;
  try {
    const raw = localStorage.getItem(textKey(userId));
    if (raw) fields = JSON.parse(raw) as T;
  } catch {}

  let media: PropertyDraftMedia | undefined;
  try {
    media = await withStore<PropertyDraftMedia | undefined>("readonly", (store) =>
      store.get(userId)
    );
  } catch {}

  const images = media?.images ?? [];
  const videos = media?.videos ?? [];
  if (!fields && images.length === 0 && videos.length === 0) return null;
  return { fields: (fields ?? {}) as T, images, videos };
}

export async function clearDraft(userId: string): Promise<void> {
  try {
    localStorage.removeItem(textKey(userId));
  } catch {}
  try {
    await withStore("readwrite", (store) => store.delete(userId));
  } catch {}
}
