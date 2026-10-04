export function canNotify(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
}

export async function requestPermission(): Promise<boolean> {
    if (!canNotify()) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
}

export function showNotification(title: string, body: string): void {
    if (!canNotify() || Notification.permission !== "granted") return;
    try {
        new Notification(title, {body, icon: "/icons/icon.svg"});
    } catch {
        // Some platforms only allow notifications created from a service worker.
    }
}
