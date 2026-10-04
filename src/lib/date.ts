const MS_PER_DAY = 86_400_000;

/** Format a Date as YYYY-MM-DD in local time (the `<input type="date">` format). */
export function toDateInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return out;
}

/** Whole days from today (local midnight) until `dateInput` (YYYY-MM-DD). Negative means past. */
export function daysUntil(dateInput: string): number {
    const [y, m, d] = dateInput.split("-").map(Number);
    const target = new Date(y, m - 1, d).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today.getTime()) / MS_PER_DAY);
}

export function isExpired(dateInput: string): boolean {
    return daysUntil(dateInput) < 0;
}

/** True when the item expires today or within `withinDays` days from now. */
export function expiringWithin(dateInput: string, withinDays: number): boolean {
    const d = daysUntil(dateInput);
    return d >= 0 && d <= withinDays;
}

export function formatDate(dateInput: string): string {
    const [y, m, d] = dateInput.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}
