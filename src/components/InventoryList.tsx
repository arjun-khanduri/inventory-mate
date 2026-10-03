"use client";

import type { InventoryItem } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/date";

interface Props {
  items: InventoryItem[];
  onToggleConsumed: (id: string) => void;
  onRemove: (id: string) => void;
}

type Tone = "expired" | "soon" | "ok";

function badge(item: InventoryItem): { text: string; tone: Tone } {
  const d = daysUntil(item.expiryDate);
  if (d < 0) return { text: `expired ${Math.abs(d)}d ago`, tone: "expired" };
  if (d === 0) return { text: "today", tone: "soon" };
  if (d === 1) return { text: "tomorrow", tone: "soon" };
  if (d <= 2) return { text: `${d} days`, tone: "soon" };
  return { text: `${d} days`, tone: "ok" };
}

const toneClass: Record<Tone, string> = {
  expired: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  soon: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ok: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

function quantity(item: InventoryItem): string {
  return [item.amount, item.unit].filter(Boolean).join(" ").trim();
}

export function InventoryList({ items, onToggleConsumed, onRemove }: Props) {
  const sorted = [...items].sort((a, b) => {
    if (a.consumed !== b.consumed) return a.consumed ? 1 : -1;
    return a.expiryDate.localeCompare(b.expiryDate);
  });

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-zinc-500">
        Your fridge is empty. Add an item above to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((item) => {
        const b = badge(item);
        const qty = quantity(item);
        return (
          <li
            key={item.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
              item.consumed
                ? "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <button
              type="button"
              onClick={() => onToggleConsumed(item.id)}
              title={item.consumed ? "Mark as not used" : "Mark as used"}
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                item.consumed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-zinc-300 text-transparent hover:border-emerald-500 dark:border-zinc-600"
              }`}
            >
              ✓
            </button>

            <div className="min-w-0 flex-1">
              <div
                className={`truncate font-medium ${
                  item.consumed ? "line-through" : ""
                }`}
              >
                {item.name}
              </div>
              <div className="truncate text-xs text-zinc-500">
                {[item.category, qty].filter(Boolean).join(" · ")}
              </div>
            </div>

            <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">
              {formatDate(item.expiryDate)}
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[b.tone]}`}
            >
              {b.text}
            </span>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              title="Remove"
              className="shrink-0 rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}
