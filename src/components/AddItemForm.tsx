"use client";

import {useState} from "react";
import {CATEGORIES, categoryDefaultDays} from "@/lib/categories";
import {addDays, toDateInput} from "@/lib/date";
import type {NewItem} from "@/lib/useInventory";

const UNITS = ["", "g", "kg", "ml", "L", "cup", "tbsp", "tsp", "piece", "can", "pack", "bottle"];

function defaultDate(category: string) {
    const days = categoryDefaultDays(category);
    return days === null ? "" : toDateInput(addDays(new Date(), days));
}

const inputClass = "w-full rounded-xl border border-line bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent";

export function AddItemForm({ onAdd }: { onAdd: (input: NewItem) => void }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0].name);
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("");
    const [expiryDate, setExpiryDate] = useState(defaultDate(CATEGORIES[0].name));
    const needsManualDate = categoryDefaultDays(category) === null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || !expiryDate) return;
        onAdd({name: trimmed, category, amount: amount.trim() || null, unit: unit.trim() || null, expiryDate});
        setName("");
        setAmount("");
        setUnit("");
        setCategory(CATEGORIES[0].name);
        setExpiryDate(defaultDate(CATEGORIES[0].name));
    }

    return <form onSubmit={handleSubmit} className="card-surface rounded-3xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Add to fridge</p>
                <h2 className="mt-1 text-lg font-bold">What did you bring home?</h2></div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                Quick add
            </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_.8fr_.9fr_auto] lg:items-end">
            <label className="sm:col-span-2 lg:col-span-1">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Item name</span>
                <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)} placeholder="e.g. Whole milk"
                    autoFocus />
            </label>
            <label>
                <span className="mb-1.5 block text-xs font-semibold text-muted">Category</span>
                <select className={inputClass}
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setExpiryDate(defaultDate(e.target.value));
                        }}>{CATEGORIES.map((c) =>
                    <option key={c.name}>{c.name}</option>)}
                </select>
            </label>
            <label>
                <span className="mb-1.5 block text-xs font-semibold text-muted">Quantity</span>
                <input className={inputClass}
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       placeholder="1"
                       inputMode="decimal" />
            </label>
            <label>
                <span className="mb-1.5 block text-xs font-semibold text-muted">Expires</span>
                <input type="date"
                       className={inputClass}
                       value={expiryDate}
                       required={needsManualDate}
                       onChange={(e) => setExpiryDate(e.target.value)} />
            </label>
            <button type="submit" disabled={!name.trim() || !expiryDate}
                    className="h-[42px] rounded-xl bg-accent px-5 text-sm font-bold text-white transition-all
                    hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40">
                {"Add item"}
            </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
            <label className="text-xs font-semibold text-muted">Unit</label>
            <input
                className="w-28 rounded-lg border border-line bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                list="unit-options"
                placeholder="optional" />
            <datalist id="unit-options">
                {UNITS.filter(Boolean).map((u) => <option key={u} value={u}/>)}
            </datalist>
            {needsManualDate && <p className="text-xs text-muted">Other items need a manual expiry date.</p>}</div>
    </form>;
}
