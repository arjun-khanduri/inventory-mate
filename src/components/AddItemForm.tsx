"use client";

import { useState } from "react";
import { CATEGORIES, categoryDefaultDays } from "@/lib/categories";
import { addDays, toDateInput } from "@/lib/date";
import type { NewItem } from "@/lib/useInventory";

const UNITS = ["", "g", "kg", "ml", "L", "cup", "tbsp", "tsp", "piece", "can", "pack", "bottle"];

function defaultDate(category: string): string {
  const days = categoryDefaultDays(category);
  return days === null ? "" : toDateInput(addDays(new Date(), days));
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500";

export function AddItemForm({ onAdd }: { onAdd: (input: NewItem) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState(defaultDate(CATEGORIES[0].name));

  const needsManualDate = categoryDefaultDays(category) === null;

  function handleCategory(next: string) {
    setCategory(next);
    setExpiryDate(defaultDate(next));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !expiryDate) return;
    onAdd({
      name: trimmed,
      category,
      amount: amount.trim() || null,
      unit: unit.trim() || null,
      expiryDate,
    });
    setName("");
    setAmount("");
    setUnit("");
    handleCategory(CATEGORIES[0].name);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-zinc-500">Item</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Whole milk"
            autoFocus
          />
        </label>

        <label className="sm:w-52">
          <span className="mb-1 block text-xs font-medium text-zinc-500">Category</span>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => handleCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2 sm:w-40">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-zinc-500">Qty</span>
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
              inputMode="decimal"
            />
          </label>
          <label className="w-24">
            <span className="mb-1 block text-xs font-medium text-zinc-500">Unit</span>
            <input
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              list="unit-options"
              placeholder="cup"
            />
            <datalist id="unit-options">
              {UNITS.filter(Boolean).map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="sm:w-44">
          <span className="mb-1 block text-xs font-medium text-zinc-500">Expires</span>
          <input
            type="date"
            className={inputClass}
            value={expiryDate}
            required={needsManualDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={!name.trim() || !expiryDate}
          className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {needsManualDate && (
        <p className="mt-2 text-xs text-zinc-500">
          “Other” has no default shelf-life — pick an expiry date.
        </p>
      )}
    </form>
  );
}
