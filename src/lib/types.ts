export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  amount: string | null;
  unit: string | null;
  /** Expiry date, stored as YYYY-MM-DD in local time. */
  expiryDate: string;
  /** ISO datetime the item was added. */
  addedAt: string;
  /** Marked used/eaten; kept in the list, dimmed, excluded from recipes. */
  consumed: boolean;
  /** Whether the "expires within 2 days" reminder has already fired for this expiry date. */
  notified: boolean;
}

export type IngredientStatus = "have" | "staple" | "missing";

export interface RecipeIngredient {
  name: string;
  status: IngredientStatus;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: string;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface CategoryDef {
  name: string;
  /** Default shelf-life in days, or null when the user must type a date. */
  defaultDays: number | null;
}
