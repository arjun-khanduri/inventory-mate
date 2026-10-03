"use client";

import type { Recipe, RecipeIngredient } from "@/lib/types";
import { coveragePercent } from "@/lib/recipes";

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onRemove: (id: string) => void;
  isSaved: boolean;
}

const statusBadge: Record<RecipeIngredient["status"], { label: string; cls: string }> = {
  have: { label: "in fridge", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  staple: { label: "staple", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
  missing: { label: "need to buy", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
};

export function RecipeDetailModal({ recipe, onClose, onSave, onRemove, isSaved }: Props) {
  if (!recipe) return null;
  const coverage = coveragePercent(recipe.ingredients);
  const have = recipe.ingredients.filter((i) => i.status === "have").length;
  const staple = recipe.ingredients.filter((i) => i.status === "staple").length;
  const missing = recipe.ingredients.filter((i) => i.status === "missing").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{recipe.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white">
            {coverage}% on hand
          </span>
          {recipe.servings && (
            <span className="text-zinc-500">Serves {recipe.servings}</span>
          )}
          <span className="text-xs text-zinc-400">
            {have} have · {staple} staple · {missing} missing
          </span>
        </div>

        {recipe.description && (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{recipe.description}</p>
        )}

        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Ingredients
        </h3>
        <ul className="mb-4 flex flex-col gap-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span>{ing.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadge[ing.status].cls}`}>
                {statusBadge[ing.status].label}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Steps</h3>
        <ol className="mb-6 flex flex-col gap-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 font-semibold text-emerald-600">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex gap-2">
          {isSaved ? (
            <button
              type="button"
              onClick={() => onRemove(recipe.id)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Remove from saved
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(recipe)}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Save recipe
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
