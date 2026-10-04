"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {AddItemForm} from "@/components/AddItemForm";
import {InventoryList} from "@/components/InventoryList";
import {RecipeDeck} from "@/components/RecipeDeck";
import {RecipeDetailModal} from "@/components/RecipeDetailModal";
import {SavedRecipes} from "@/components/SavedRecipes";
import {useInventory} from "@/lib/useInventory";
import {useStoredCollection} from "@/lib/useStoredCollection";
import {STORE_SAVED} from "@/lib/storage";
import {generateRecipes, isConfigured} from "@/lib/recipes";
import {expiringWithin, isExpired} from "@/lib/date";
import {canNotify, requestPermission, showNotification} from "@/lib/notifications";
import type {Recipe} from "@/lib/types";

type Tab = "fridge" | "cook" | "saved";
const tabs: {id: Tab; label: string; eyebrow: string}[] = [
    {id: "fridge", label: "My fridge", eyebrow: "Inventory"},
    {id: "cook", label: "Cook something", eyebrow: "Ideas"},
    {id: "saved", label: "Saved recipes", eyebrow: "Collection"},
];

export default function Home() {
    const inventory = useInventory();
    const {items: savedItems, setItems: setSavedItems} = useStoredCollection<Recipe>(STORE_SAVED);
    const [tab, setTab] = useState<Tab>("fridge");
    const [deck, setDeck] = useState<Recipe[]>([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Recipe | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (canNotify()) setPermission(Notification.permission);
    }, []);

    const activeItems = inventory.items.filter((i) => !i.consumed);
    const expiring = activeItems.filter((i) => expiringWithin(i.expiryDate, 2));
    const expired = activeItems.filter((i) => isExpired(i.expiryDate));
    const categories = new Set(activeItems.map((i) => i.category));
    const filteredItems = useMemo(() => activeItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase())), [activeItems, query]);

    const notifyPending = useCallback(() => {
        if (!inventory.loaded) return;
        const pending = inventory.items.filter((i) => !i.consumed && expiringWithin(i.expiryDate, 2) && !i.notified);
        if (!pending.length) return;
        showNotification("Expiring soon", `${pending.length === 1 ? pending[0].name : `${pending.length} items`} ${pending.length === 1 ? "expires" : "expire"} within 2 days.`);
        inventory.markNotified(pending.map((i) => i.id));
    }, [inventory]);

    useEffect(() => {
        if (inventory.loaded && canNotify() && Notification.permission === "granted") notifyPending();
    }, [inventory.loaded, inventory.items, notifyPending]);

    async function enableReminders() {
        const granted = await requestPermission();
        if (granted) {
            setPermission("granted");
            notifyPending();
        }
    }
    const isSaved = useCallback((id: string) => savedItems.some((r) => r.id === id), [savedItems]);
    const saveRecipe = useCallback((r: Recipe) => setSavedItems((prev) => prev.some((x) => x.id === r.id) ? prev : [r, ...prev]), [setSavedItems]);
    const removeSaved = useCallback((id: string) => setSavedItems((prev) => prev.filter((x) => x.id !== id)), [setSavedItems]);
    async function handleGenerate() {
        setGenerating(true);
        setError(null);
        try {
            setDeck(await generateRecipes(inventory.items));
            setTab("cook");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <main className="app-shell min-h-screen">
            <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_1fr]">
                <aside className="hidden border-r border-line/80 px-6 py-8 lg:flex lg:flex-col">
                    <div className="mb-12 flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-2xl bg-accent text-lg text-white shadow-lg shadow-accent/20">F</div>
                        <div>
                            <p className="text-sm font-bold tracking-tight">Fridgeful</p>
                            <p className="text-xs text-muted">Eat well. Waste less.</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2" aria-label="Main navigation">
                        {tabs.map((t) => (
                            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${tab === t.id ? "bg-accent-soft text-accent-strong shadow-sm" : "text-muted hover:bg-card hover:text-foreground"}`}>
                                <span className={`size-2 rounded-full ${tab === t.id ? "bg-accent" : "bg-line"}`} />
                                <span>
                                    <span className="block text-sm font-semibold">{t.label}</span>
                                    <span className="block text-[11px] opacity-70">{t.eyebrow}</span>
                                </span>
                            </button>
                        ))}
                    </nav>
                    <div className="mt-auto rounded-3xl bg-accent p-5 text-white shadow-xl shadow-accent/15">
                        <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/70">Kitchen note</p>
                        <p className="mt-3 text-sm leading-6">Use what you have first. Your future self will thank you.</p>
                    </div>
                </aside>

                <section className="min-w-0 px-4 pb-28 pt-5 sm:px-8 sm:py-8 lg:px-14 lg:py-12 lg:pb-12">
                    <header className="mb-8 flex items-start justify-between gap-5">
                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent">{tabs.find((t) => t.id === tab)?.eyebrow}</p>
                            <h1 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{tab === "fridge" ? "Good food starts here." : tab === "cook" ? "What will you make?" : "Your kitchen, curated."}</h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">{tab === "fridge" ? "Keep a clear view of what is fresh, what needs attention, and what is ready to become dinner." : tab === "cook" ? "Turn the ingredients you already own into something worth looking forward to." : "The recipes you loved, ready whenever inspiration strikes."}</p>
                        </div>
                        <div className="hidden size-12 place-items-center rounded-2xl border border-line bg-card text-sm font-bold text-accent shadow-sm sm:grid">{activeItems.length}</div>
                    </header>
                    <nav className="mobile-tab-bar lg:hidden" aria-label="Main navigation">
                        {tabs.map((t) => (
                            <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined} className={`mobile-tab ${tab === t.id ? "mobile-tab-active" : ""}`}>
                                <span className="mobile-tab-label">{t.label}</span>
                                <span className="mobile-tab-eyebrow">{t.eyebrow}</span>
                            </button>
                        ))}
                    </nav>

                    {tab === "fridge" && (
                        <div className="flex flex-col gap-6 animate-rise">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="card-surface rounded-3xl p-4">
                                    <p className="text-xs text-muted">In your fridge</p>
                                    <p className="mt-2 text-3xl font-bold">{activeItems.length}</p>
                                    <p className="mt-1 text-xs text-muted">active items</p>
                                </div>
                                <div className="card-surface rounded-3xl p-4">
                                    <p className="text-xs text-muted">Fresh today</p>
                                    <p className="mt-2 text-3xl font-bold text-accent">{activeItems.length - expiring.length}</p>
                                    <p className="mt-1 text-xs text-muted">good to go</p>
                                </div>
                                <div className="card-surface rounded-3xl p-4">
                                    <p className="text-xs text-muted">Use soon</p>
                                    <p className="mt-2 text-3xl font-bold text-warm">{expiring.length}</p>
                                    <p className="mt-1 text-xs text-muted">next 2 days</p>
                                </div>
                                <div className="card-surface rounded-3xl p-4">
                                    <p className="text-xs text-muted">Categories</p>
                                    <p className="mt-2 text-3xl font-bold">{categories.size}</p>
                                    <p className="mt-1 text-xs text-muted">represented</p>
                                </div>
                            </div>
                            <AddItemForm onAdd={inventory.addItem} />
                            {expiring.length > 0 && (
                                <div className="flex flex-col gap-3 rounded-3xl border border-[#efd798] bg-[#fff9e9] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-[#8b681e]">A little nudge from your fridge</p>
                                        <p className="mt-1 text-[#9b7b39]">{expiring.length} item{expiring.length > 1 ? "s" : ""} should be used within 2 days.</p>
                                    </div>
                                    {canNotify() && permission !== "granted" && (
                                        <button onClick={enableReminders} className="rounded-xl bg-[#d99b22] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">Enable reminders</button>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold">Your ingredients</h2>
                                    <p className="text-sm text-muted">{activeItems.length ? "A live view of everything you can cook with." : "Your next meal starts with one small addition."}</p>
                                </div>
                                <div className="relative">
                                    <input aria-label="Search ingredients" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fridge" className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent sm:w-52" />
                                </div>
                            </div>
                            <InventoryList items={query ? filteredItems : inventory.items} onToggleConsumed={inventory.toggleConsumed} onRemove={inventory.removeItem} />
                            {expired.length > 0 && <button onClick={inventory.removeExpired} className="self-start text-xs font-bold text-danger underline-offset-4 hover:underline">Clear {expired.length} expired item{expired.length > 1 ? "s" : ""}</button>}
                        </div>
                    )}

                    {tab === "cook" && (
                        <div className="flex flex-col gap-6 animate-rise">
                            <div className="card-surface overflow-hidden rounded-[2rem] p-6 sm:p-8">
                                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-accent">Recipe studio</p>
                                        <h2 className="text-2xl font-bold tracking-tight">Make tonight delicious.</h2>
                                        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Your soonest-to-expire ingredients will be prioritized, so nothing good goes to waste.</p>
                                    </div>
                                    <button onClick={handleGenerate} disabled={generating || activeItems.length === 0 || !isConfigured()} className="rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40">{generating ? "Finding your next meal…" : "Generate recipes"}</button>
                                </div>
                                {!isConfigured() && <p className="mt-5 rounded-xl bg-accent-soft p-3 text-xs leading-5 text-accent-strong">Recipe generation is not configured yet. Connect the worker URL to unlock personalized ideas.</p>}
                                {error && <p className="mt-4 text-sm text-danger">{error}</p>}
                            </div>
                            {deck.length > 0 && <RecipeDeck recipes={deck} onOpen={setSelected} onSave={saveRecipe} isSaved={isSaved} />}
                        </div>
                    )}
                    {tab === "saved" && <div className="animate-rise"><SavedRecipes recipes={savedItems} onOpen={setSelected} /></div>}
                </section>
            </div>
            <RecipeDetailModal recipe={selected} onClose={() => setSelected(null)} onSave={saveRecipe} onRemove={removeSaved} isSaved={selected ? isSaved(selected.id) : false} />
        </main>
    );
}
