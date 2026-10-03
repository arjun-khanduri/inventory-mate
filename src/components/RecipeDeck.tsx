"use client";

import { useRef, useState } from "react";
import type { Recipe } from "@/lib/types";
import { coveragePercent } from "@/lib/recipes";

interface Props {
  recipes: Recipe[];
  onOpen: (r: Recipe) => void;
  onSave: (r: Recipe) => void;
  isSaved: (id: string) => boolean;
}

export function RecipeDeck({ recipes, onOpen, onSave, isSaved }: Props) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  if (recipes.length === 0) return null;

  const i = Math.min(index, recipes.length - 1);
  const recipe = recipes[i];
  const coverage = coveragePercent(recipe.ingredients);

  const next = () => setIndex((p) => (p + 1) % recipes.length);
  const prev = () => setIndex((p) => (p - 1 + recipes.length) % recipes.length);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    moved.current = false;
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current != null && Math.abs(e.clientX - startX.current) > 8) {
      moved.current = true;
    }
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current == null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    } else if (!moved.current) {
      onOpen(recipe);
    }
    startX.current = null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="button"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(recipe);
          }
        }}
        style={{ touchAction: "pan-y" }}
        className="w-full max-w-md cursor-pointer select-none rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-2 text-xs font-medium text-zinc-500">
          {i + 1} / {recipes.length} · tap for details
        </div>
        <h3 className="mb-1 text-xl font-semibold">{recipe.title}</h3>
        {recipe.description && (
          <p className="mb-3 text-sm text-zinc-500">{recipe.description}</p>
        )}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-emerald-600">{coverage}%</span>
          <span className="text-sm text-zinc-500">of ingredients on hand</span>
        </div>
        {recipe.servings && (
          <p className="text-sm text-zinc-500">Serves {recipe.servings}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onSave(recipe)}
          disabled={isSaved(recipe.id)}
          className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-300 dark:hover:bg-emerald-950"
        >
          {isSaved(recipe.id) ? "Saved ✓" : "Save"}
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Next →
        </button>
      </div>
      <p className="text-xs text-zinc-400">Swipe left/right to browse</p>
    </div>
  );
}
