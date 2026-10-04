"use client";

import {useEffect, useState} from "react";
import {getAll, putAll} from "./storage";

/** A list persisted to an IndexedDB object store, loaded once on mount. */
export function useStoredCollection<T>(store: string) {
    const [items, setItems] = useState<T[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getAll<T>(store)
            .catch((err) => {
                console.error(`Failed to load "${store}"`, err);
                return [] as T[];
            })
            .then((rows) => {
                if (!cancelled) {
                    setItems(rows);
                    setLoaded(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [store]);

    useEffect(() => {
        if (!loaded) return;
        putAll(store, items).catch((err) => console.error(`Failed to save "${store}"`, err));
    }, [items, loaded, store]);

    return {items, setItems, loaded};
}
