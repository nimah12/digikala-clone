import { useSyncExternalStore } from "react";

export type NotificationEvent = {
  id: string;
  type: "login" | "logout" | "order" | "info";
  title: string;
  description?: string;
  time: string;
  unread: boolean;
  href?: string;
};

const KEY = "dk-events";
const MAX = 20;

function faNow(): string {
  return new Date().toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getEvents(): NotificationEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const events = raw ? (JSON.parse(raw) as NotificationEvent[]) : [];
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function pushEvent(evt: Omit<NotificationEvent, "id" | "time" | "unread">) {
  if (typeof window === "undefined") return;
  try {
    const events = getEvents();
    events.unshift({
      ...evt,
      id: `${evt.type}-${Date.now()}`,
      time: faNow(),
      unread: true,
    });
    localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX)));
    window.dispatchEvent(new Event("dk-notifications-changed"));
  } catch {}
}

export function unreadCount(): number {
  return getEvents().filter((e) => e.unread).length;
}

export function markAllRead() {
  if (typeof window === "undefined") return;
  try {
    const events = getEvents();
    if (events.some((e) => e.unread)) {
      localStorage.setItem(
        KEY,
        JSON.stringify(events.map((e) => ({ ...e, unread: false }))),
      );
      window.dispatchEvent(new Event("dk-notifications-changed"));
    }
  } catch {}
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("dk-notifications-changed"));
  } catch {}
}

let cachedRaw: string | null | undefined;
let cachedEvents: NotificationEvent[] = [];

function getSnapshot(): NotificationEvent[] {
  if (typeof window === "undefined") return cachedEvents;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedEvents;
    cachedRaw = raw;
    cachedEvents = raw ? (JSON.parse(raw) as NotificationEvent[]) : [];
    return Array.isArray(cachedEvents) ? cachedEvents : [];
  } catch {
    return cachedEvents;
  }
}

function subscribeNotifications(cb: () => void) {
  window.addEventListener("dk-notifications-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dk-notifications-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

export function useNotificationEvents(): NotificationEvent[] {
  return useSyncExternalStore(subscribeNotifications, getSnapshot, () => []);
}
