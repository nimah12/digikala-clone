import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "./user";

function setupStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  return store;
}

beforeEach(() => {
  setupStorage();
  vi.restoreAllMocks();
});

describe("user", () => {
  it("returns null when no user stored", () => {
    expect(getCurrentUser()).toBeNull();
  });

  it("sets and reads the current user", () => {
    setCurrentUser({ name: "نیما", email: "nima@test.com" });
    expect(getCurrentUser()).toEqual({ name: "نیما", email: "nima@test.com" });
  });

  it("dispatches dk-user-changed on set", () => {
    const spy = vi.fn();
    window.addEventListener("dk-user-changed", spy);
    setCurrentUser({ name: "نیما" });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("clears user and token and dispatches event", () => {
    localStorage.setItem("dk-user", "{}");
    localStorage.setItem("dk-token", "abc");
    const spy = vi.fn();
    window.addEventListener("dk-user-changed", spy);

    clearCurrentUser();

    expect(localStorage.getItem("dk-user")).toBeNull();
    expect(localStorage.getItem("dk-token")).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getCurrentUser()).toBeNull();
  });

  it("returns null on malformed stored JSON", () => {
    localStorage.setItem("dk-user", "{not-json");
    expect(getCurrentUser()).toBeNull();
  });
});