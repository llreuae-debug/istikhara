export interface RecentMediaBg {
  id: string;
  name: string;
  kind: "image" | "video";
  dataUrlOrBlob: Blob;
  createdAt: number;
}

const DB_NAME = "istikhara-studio-media";
const STORE = "backgrounds";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecentMediaBg(item: RecentMediaBg): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export async function listRecentMediaBgs(): Promise<RecentMediaBg[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () =>
        resolve(
          ((req.result as RecentMediaBg[]) || []).sort(
            (a, b) => b.createdAt - a.createdAt
          )
        );
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteRecentMediaBg(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
