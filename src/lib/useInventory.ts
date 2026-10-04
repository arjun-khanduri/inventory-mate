"use client";

import {useCallback} from "react";
import type {InventoryItem} from "./types";
import {STORE_ITEMS} from "./storage";
import {uid} from "./id";
import {daysUntil} from "./date";
import {useStoredCollection} from "./useStoredCollection";

export type NewItem = Omit<InventoryItem, "id" | "addedAt" | "consumed" | "notified">;

export function useInventory() {
    const {items, loaded, setItems} = useStoredCollection<InventoryItem>(STORE_ITEMS);

    const addItem = useCallback(
        (input: NewItem) => {
            const item: InventoryItem = {
                ...input,
                id: uid(),
                addedAt: new Date().toISOString(),
                consumed: false,
                notified: false,
            };
            setItems((prev) => [item, ...prev]);
        },
        [setItems],
    );

    const toggleConsumed = useCallback(
        (id: string) => {
            setItems((prev) => prev.map((i) => (i.id === id ? {...i, consumed: !i.consumed} : i)));
        },
        [setItems],
    );

    const removeItem = useCallback(
        (id: string) => {
            setItems((prev) => prev.filter((i) => i.id !== id));
        },
        [setItems],
    );

    const removeExpired = useCallback(() => {
        setItems((prev) => prev.filter((i) => daysUntil(i.expiryDate) >= 0));
    }, [setItems]);

    const markNotified = useCallback(
        (ids: string[]) => {
            if (ids.length === 0) return;
            const idSet = new Set(ids);
            setItems((prev) => prev.map((i) => (idSet.has(i.id) ? {...i, notified: true} : i)));
        },
        [setItems],
    );

    return {items, loaded, addItem, toggleConsumed, removeItem, removeExpired, markNotified};
}
