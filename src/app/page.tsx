"use client";

import { useCallback, useEffect, useState } from "react";
import { AddItemForm } from "@/components/AddItemForm";
import { InventoryList } from "@/components/InventoryList";
import { RecipeDeck } from "@/components/RecipeDeck";
import { RecipeDetailModal } from "@/components/RecipeDetailModal";
import { SavedRecipes } from "@/components/SavedRecipes";
import { useInventory } from "@/lib/useInventory";
import { useStoredCollection } from "@/lib/useStoredCollection";
import { STORE_SAVED } from "@/lib/storage";
import { generateRecipes, isConfigured } from "@/lib/recipes";
import { expiringWithin, isExpired } from "@/lib/date";
import { canNotify, requestPermission, showNotification } from "@/lib/notifications";
import type { Recipe } from "@/lib/types";

type Tab = "fridge" | "cook" | "saved";

const TABS: { id: Tab; label: string }[] = [
  { id: "fridge", label: "Fridge" },
  { id: "cook", label: "Cook" },
  { id: "saved", label: "Saved" },
];

export default function Home() {
  const inventory = useInventory();
  const { items: savedItems, setItems: setSavedItems } = useStoredCollection<Recipe>(STORE_SAVED);

  const [tab, setTab] = useState<Tab>("fridge");
  const [deck, setDeck] = useState<Recipe[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (canNotify()) setPermission(Notification.permission);
  }, []);

  const activeItems = inventory.items.filter((i) => !i.consumed);
  const expiring = activeItems.filter((i) => expiringWithin(i.expiryDate, 2));
  const hasExpired = activeItems.some((i) => isExpired(i.expiryDate));

  const notifyPending = useCallback(() => {
    if (!inventory.loaded) return;
    const pending = inventory.items.filter(
      (i) => !i.consumed && expiringWithin(i.expiryDate, 2) && !i.notified,
    );
    if (pending.length === 0) return;
    const label = pending.length === 1 ? pending[0].name : `${pending.length} items`;
    const verb = pending.length === 1 ? "expires" : "expire";
    showNotification("Expiring soon", `${label} ${verb} within 2 days.`);
    inventory.markNotified(pending.map((i) => i.id));
  }, [inventory]);

  useEffect(() => {
    if (inventory.loaded && canNotify() && Notification.permission === "granted") {
      notifyPending();
    }
  }, [inventory.loaded, inventory.items, notifyPending]);

  async function enableReminders() {
    const granted = await requestPermission();
    if (granted) {
      setPermission("granted");
      notifyPending();
    }
  }

  const isSaved = useCallback(
    (id: string) => savedItems.some((r) => r.id === id),
    [savedItems],
  );

  const saveRecipe = useCallback(
    (r: Recipe) => {
      setSavedItems((prev) => (prev.some((x) => x.id === r.id) ? prev : [r, ...prev]));
    },
    [setSavedItems],
  );

  const removeSaved = useCallback(
    (id: string) => setSavedItems((prev) => prev.filter((x) => x.id !== id)),
    [setSavedItems],
  );

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const recipes = await generateRecipes(inventory.items);
      setDeck(recipes);
      setTab("cook");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fridge</h1>
        <nav className="flex gap-1 rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === "fridge" && (
        <>
          <AddItemForm onAdd={inventory.addItem} />

          {expiring.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              <div className="font-semibold text-amber-800 dark:text-amber-300">
                {expiring.length} item{expiring.length > 1 ? "s" : ""} expiring within 2 days
              </div>
              <ul className="mt-1 flex flex-wrap gap-2">
                {expiring.map((i) => (
                  <li
                    key={i.id}
                    className="rounded-full bg-white px-2 py-0.5 text-xs dark:bg-zinc-900"
                  >
                    {i.name}
                  </li>
                ))}
              </ul>
              {canNotify() && permission !== "granted" && (
                <button
                  type="button"
                  onClick={enableReminders}
                  className="mt-2 rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
                >
                  Enable reminders
                </button>
              )}
            </div>
          )}

          <InventoryList
            items={inventory.items}
            onToggleConsumed={inventory.toggleConsumed}
            onRemove={inventory.removeItem}
          />

          {hasExpired && (
            <button
              type="button"
              onClick={inventory.removeExpired}
              className="self-end rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Remove expired
            </button>
          )}
        </>
      )}

      {tab === "cook" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {!isConfigured() ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="mb-1 font-medium">Recipe service not configured.</p>
                <p>
                  Deploy the worker in <code className="text-xs">worker/worker.js</code> to Cloudflare,
                  set its <code className="text-xs">GROQ_API_KEY</code> secret, then set{" "}
                  <code className="text-xs">NEXT_PUBLIC_RECIPE_API_URL</code> to the worker URL and
                  rebuild.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Generate recipes from your {activeItems.length} fridge item
                  {activeItems.length === 1 ? "" : "s"}.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || activeItems.length === 0}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generating ? "Thinking…" : "Generate recipes"}
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {deck.length > 0 && (
            <RecipeDeck
              recipes={deck}
              onOpen={setSelected}
              onSave={saveRecipe}
              isSaved={isSaved}
            />
          )}
        </div>
      )}

      {tab === "saved" && <SavedRecipes recipes={savedItems} onOpen={setSelected} />}

      <RecipeDetailModal
        recipe={selected}
        onClose={() => setSelected(null)}
        onSave={saveRecipe}
        onRemove={removeSaved}
        isSaved={selected ? isSaved(selected.id) : false}
      />
    </main>
  );
}
