import type { InventoryItem, IngredientStatus, Recipe, RecipeIngredient } from "./types";
import { daysUntil } from "./date";
import { uid } from "./id";

/**
 * Recipe generation runs on Groq's hosted open-weight models (Llama/Mistral/Qwen)
 * through a serverless proxy (the Cloudflare Worker in `worker/`), which holds the key.
 *
 * The Worker URL is not secret, so it ships as a default; override with
 * NEXT_PUBLIC_RECIPE_API_URL if you ever move the Worker.
 */
const API_URL = process.env.NEXT_PUBLIC_RECIPE_API_URL;
const MODEL = process.env.NEXT_PUBLIC_RECIPE_MODEL;

export const STAPLES: string[] = [
  "salt",
  "pepper",
  "cooking oil",
  "olive oil",
  "butter",
  "onion",
  "garlic",
  "sugar",
  "flour",
  "soy sauce",
  "vinegar",
  "basic spices and dried herbs",
];

export function isConfigured(): boolean {
  return Boolean(API_URL);
}

export function coveragePercent(ingredients: RecipeIngredient[]): number {
  const have = ingredients.filter((i) => i.status === "have").length;
  const missing = ingredients.filter((i) => i.status === "missing").length;
  const total = have + missing;
  if (total === 0) return 100;
  return Math.round((have / total) * 100);
}

const SYSTEM_PROMPT = `You are a home cooking assistant. Given the items in the user's fridge and a list of assumed pantry staples, suggest recipes the user can make.

Rules:
- Prioritize items that expire soonest; try to use them up.
- Mark an ingredient "have" only when it plausibly matches an item in the fridge list. Match by common sense, not exact wording (e.g. "sour cream" matches "cream", "chicken breast" matches "chicken"). Do NOT mark "have" for anything not in the fridge list.
- Mark an ingredient "staple" only when it is a basic pantry item from the staples list.
- Otherwise mark it "missing" (the user would need to buy it).
- Produce exactly 5 recipes, preferring those with many "have" ingredients and few "missing".
- Respond with JSON only, in exactly this shape:
{"recipes":[{"title":string,"description":string,"servings":string,"ingredients":[{"name":string,"status":"have"|"staple"|"missing"}],"steps":[string]}]}`;

function buildUserPrompt(items: InventoryItem[]): string {
  const active = items
    .filter((i) => !i.consumed)
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  const fridge = active.map((i) => ({
    name: i.name,
    amount: [i.amount, i.unit].filter(Boolean).join(" ").trim() || null,
    daysUntilExpiry: daysUntil(i.expiryDate),
  }));

  return `Fridge items (sorted by days until expiry):
${JSON.stringify(fridge, null, 2)}

Assumed pantry staples:
${STAPLES.join(", ")}`;
}

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function asStatus(value: unknown): IngredientStatus {
  return value === "have" || value === "staple" || value === "missing" ? value : "missing";
}

function normalize(raw: unknown): Recipe[] {
  const obj = (raw ?? {}) as { recipes?: unknown };
  const list = Array.isArray(obj.recipes) ? obj.recipes : [];
  return list.map((entry) => {
    const r = entry as Record<string, unknown>;
    const ingredients: RecipeIngredient[] = Array.isArray(r.ingredients)
      ? (r.ingredients as Array<Record<string, unknown>>).map((ing) => ({
          name: String(ing.name ?? "ingredient"),
          status: asStatus(ing.status),
        }))
      : [];
    const steps: string[] = Array.isArray(r.steps)
      ? (r.steps as unknown[]).map((s) => String(s))
      : [];
    return {
      id: uid(),
      title: String(r.title ?? "Untitled recipe"),
      description: String(r.description ?? ""),
      servings: String(r.servings ?? ""),
      ingredients,
      steps,
    };
  });
}

export async function generateRecipes(items: InventoryItem[]): Promise<Recipe[]> {
  if (!API_URL) {
    throw new Error(
      "Recipe service not configured. Set NEXT_PUBLIC_RECIPE_API_URL to your Cloudflare Worker URL.",
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(items) },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Recipe service error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GroqResponse;
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) {
    throw new Error("Recipe service returned no content.");
  }
  return normalize(JSON.parse(text));
}
