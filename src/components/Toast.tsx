"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export type ToastPayload = {
  title: string;
  description?: string;
  href?: string;
};

const TOAST_EVENT = "dk-toast";

export function showToast(payload: ToastPayload) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
}

export default function Toast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onToast = (e: Event) => {
      setToast((e as CustomEvent).detail as ToastPayload);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setToast(null);
        if (toast.href) router.push(toast.href);
      }}
      className="fixed bottom-5 left-4 z-[100] flex items-start gap-3 rounded-2xl border shadow-2xl px-4 py-3 text-start max-w-[320px] transition-transform"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ background: "var(--dk-green, #26a65b)" }}
      >
        <Icon name="check" size={18} strokeWidth={2.2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-bold mb-0.5">{toast.title}</span>
        {toast.description && (
          <span className="block text-[11px] leading-5" style={{ color: "var(--text-secondary)" }}>
            {toast.description}
          </span>
        )}
        {toast.href && (
          <span className="block text-[11px] font-bold mt-1 text-dk-red">
            مشاهده و پیگیری سفارش
          </span>
        )}
      </span>
    </button>
  );
}
