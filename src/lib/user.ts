"use client";

import { useState, useEffect } from "react";

export type CurrentUser = {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
};

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
