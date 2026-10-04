"use client";

import type {Recipe, RecipeIngredient} from "@/lib/types";
import {coveragePercent} from "@/lib/recipes";

const statusBadge: Record<RecipeIngredient["status"], {label: string; cls: string}> = {
    have: {label: "In your fridge", cls: "bg-accent-soft text-accent-strong"},
    staple: {label: "Pantry staple", cls: "bg-background text-muted"},
    missing: {label: "Add to list", cls: "bg-[#fff3cf] text-[#8b681e]"}
};

interface Props {
    recipe: Recipe | null;
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
    onRemove: (id: string) => void;
    isSaved: boolean;
}

export function RecipeDetailModal({ recipe, onClose, onSave, onRemove, isSaved }: Props) {
    if (!recipe) return null;
    const coverage = coveragePercent(recipe.ingredients);

    return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#132017]/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
                onClick={onClose}>
        <div role="dialog"
             aria-modal="true"
             aria-labelledby="recipe-title"
             className="animate-float card-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
             onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Recipe details</p>
                    <h2 id="recipe-title" className="mt-2 text-2xl font-bold tracking-tight">{recipe.title}</h2>
                </div>
                <button type="button"
                        onClick={onClose}
                        aria-label="Close recipe"
                        className="grid size-9 place-items-center rounded-xl border border-line text-muted transition hover:bg-background">
                    ×
                </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white">{coverage}% on hand</span>
                {recipe.servings && <span className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted">
                    Serves {recipe.servings}
                </span>}
            </div>
            {recipe.description && <p className="mt-5 text-sm leading-6 text-muted">{recipe.description}</p>}
            <div className="mt-8 grid gap-8 sm:grid-cols-[.9fr_1.1fr]">
                <section>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted">Ingredients</h3>
                    <ul className="flex flex-col gap-2">
                        {recipe.ingredients.map((ing, i) =>
                            <li key={i} className="flex items-center justify-between gap-3 border-b border-line/70 pb-2 text-sm">
                                <span>{ing.name}</span>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadge[ing.status].cls}`}>
                                    {statusBadge[ing.status].label}
                                </span>
                            </li>)}
                    </ul>
                </section>
                <section>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted">Method</h3>
                    <ol className="flex flex-col gap-4">
                        {recipe.steps.map((step, i) =>
                            <li key={i} className="flex gap-3 text-sm leading-6">
                                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                                    {i + 1}
                                </span>
                                <span>{step}</span>
                            </li>)}
                    </ol>
                </section>
            </div>
            <div className="mt-8 flex gap-3">
                <button type="button"
                        onClick={() => isSaved ? onRemove(recipe.id) : onSave(recipe)}
                        className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-strong">
                    {isSaved ? "Remove from saved" : "Save recipe"}
                </button>
                <button type="button"
                        onClick={onClose}
                        className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-background">
                    Close
                </button>
            </div>
        </div>
    </div>;
}
