"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

export type CurrentUser = {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
};

// ایمیل یکتای کاربر دمو (ورود آزمایشی) که نباید از قابلیت‌های حساب واقعی استفاده کند
export const DEMO_USER_EMAIL = "demo@digikala-clone.local";

export function isDemoUser(user: CurrentUser | null): boolean {
  return !!user && user.email === DEMO_USER_EMAIL;
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("dk-user");
    if (!stored) return null;
    return JSON.parse(stored) as CurrentUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser) {
  try {
    localStorage.setItem("dk-user", JSON.stringify(user));
    window.dispatchEvent(new Event("dk-user-changed"));
  } catch {}
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem("dk-user");
    localStorage.removeItem("dk-token");
    window.dispatchEvent(new Event("dk-user-changed"));
  } catch {}
}

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    window.addEventListener("dk-user-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dk-user-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}

let cachedRaw: string | null = null;
let cachedUser: CurrentUser | null = null;

function getUserSnapshot(): CurrentUser | null {
  if (typeof window === "undefined") return cachedUser;
  try {
    const stored = localStorage.getItem("dk-user");
    if (stored === cachedRaw) return cachedUser;
    cachedRaw = stored;
    cachedUser = stored ? (JSON.parse(stored) as CurrentUser) : null;
    return cachedUser;
  } catch {
    return cachedUser;
  }
}

function subscribeUser(cb: () => void) {
  window.addEventListener("dk-user-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dk-user-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

export function useUserSync(): CurrentUser | null {
  return useSyncExternalStore(subscribeUser, getUserSnapshot, () => null);
}
