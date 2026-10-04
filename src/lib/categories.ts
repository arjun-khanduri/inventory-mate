import type {CategoryDef} from "./types";

/** Approved P0 category -> default shelf-life table. */
export const CATEGORIES: CategoryDef[] = [
    {name: "Dairy", defaultDays: 7},
    {name: "Eggs", defaultDays: 21},
    {name: "Produce (fruit/veg)", defaultDays: 6},
    {name: "Raw meat / seafood", defaultDays: 2},
    {name: "Deli / ready-to-eat", defaultDays: 4},
    {name: "Leftovers / cooked", defaultDays: 3},
    {name: "Bread / bakery", defaultDays: 5},
    {name: "Beverages", defaultDays: 10},
    {name: "Condiments / sauces", defaultDays: 45},
    {name: "Pantry (dry/canned)", defaultDays: 90},
    {name: "Other", defaultDays: null},
];

export function categoryDefaultDays(name: string): number | null {
    return CATEGORIES.find((c) => c.name === name)?.defaultDays ?? null;
}
