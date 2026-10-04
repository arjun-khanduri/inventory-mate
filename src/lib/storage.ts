const DB_NAME = "fridge";
const DB_VERSION = 1;

export const STORE_ITEMS = "items";
export const STORE_SAVED = "savedRecipes";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_ITEMS)) {
                db.createObjectStore(STORE_ITEMS, {keyPath: "id"});
            }
            if (!db.objectStoreNames.contains(STORE_SAVED)) {
                db.createObjectStore(STORE_SAVED, {keyPath: "id"});
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("Failed to open database"));
    });
    return dbPromise;
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
    });
}

function promisifyTx(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
        tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
}

export async function getAll<T>(store: string): Promise<T[]> {
    const db = await openDb();
    return promisify(db.transaction(store, "readonly").objectStore(store).getAll()) as Promise<T[]>;
}

/** Replace the entire contents of a store with `values`. */
export async function putAll<T>(store: string, values: T[]): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    await promisify(objectStore.clear());
    for (const value of values) {
        objectStore.put(value);
    }
    await promisifyTx(tx);
}
