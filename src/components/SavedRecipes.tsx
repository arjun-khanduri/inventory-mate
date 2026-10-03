"use client";

import type { Recipe } from "@/lib/types";
import { coveragePercent } from "@/lib/recipes";

interface Props {
  recipes: Recipe[];
  onOpen: (r: Recipe) => void;
}

export function SavedRecipes({ recipes, onOpen }: Props) {
  if (recipes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No saved recipes yet. Save one from the Cook tab.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {recipes.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onOpen(r)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-medium">{r.title}</span>
              <span className="shrink-0 text-sm font-semibold text-emerald-600">
                {coveragePercent(r.ingredients)}%
              </span>
            </div>
            {r.description && (
              <p className="truncate text-xs text-zinc-500">{r.description}</p>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
