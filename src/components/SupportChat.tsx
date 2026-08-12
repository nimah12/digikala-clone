"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import PriceBadge from "./PriceBadge";
import { faNormalize } from "@/lib/normalize";

type Message = { from: "user" | "bot"; text: string };

type BotProduct = {
  name: string;
  slug: string;
  price: number;
  discountPercent: number;
  imageUrl: string | null;
};

type BotLink = { label: string; href: string };

type BotResponse = {
  text: string;
  products?: BotProduct[];
  order?: { id: number; status: string; total: number } | null;
  askOrderId?: boolean;
  links?: BotLink[];
};

const QUICK_REPLIES = [
  { label: "پیگیری سفارش", text: "پیگیری سفارشم" },
  { label: "تخفیف‌ها", text: "چه تخفیف‌هایی دارید؟" },
  { label: "پرفروش‌ترین‌ها", text: "پرفروش‌ترین‌ها" },
  { label: "هدفون", text: "هدفون می‌خوام" },
  { label: "مرجوعی", text: "شرایط مرجوعی کالا چیه؟" },
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "سلام! به پشتیبانی آنلاین دیجی‌کلون خوش اومدی. چطور می‌تونم کمکت کنم؟ می‌تونی درباره ارسال، مرجوعی، پرداخت، گارانتی، پیگیری سفارش بپرسی یا اسم محصول موردنظرت رو بنویسی تا برات پیدا کنم." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [extra, setExtra] = useState<{ products?: BotProduct[]; order?: BotResponse["order"]; links?: BotLink[] } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing, extra, open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "user", text: trimmed }]);
    setExtra(null);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: faNormalize(trimmed) }),
      });
      const data: BotResponse = await res.json();
      setMessages((m) => [...m, { from: "bot", text: data.text }]);
      setExtra({ products: data.products, order: data.order, links: data.links });
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "یک لحظه صبر کن، دوباره تلاش می‌کنم..." }]);
    } finally {
      setTyping(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-50 w-14 h-14 rounded-full bg-dk-red text-white shadow-xl hover:bg-dk-red-dark transition-all flex items-center justify-center"
        aria-label={open ? "بستن پشتیبانی" : "پشتیبانی آنلاین"}
        title="پشتیبانی آنلاین"
      >
        {open ? (
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 left-5 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden"
          style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {/* Header */}
          <div className="bg-dk-red text-white px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Icon name="headphones" size={20} /></div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-dk-green border-2 border-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">پشتیبانی دیجی‌کلون</div>
              <div className="text-[11px] text-white/80">پاسخگویی ۲۴ ساعته، ۷ روز هفته</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold digits" dir="ltr">
                <Icon name="phonecall" size={13} />
                ۰۲۱-۹۱۰۰۱۰۰۰
              </div>
              <div className="text-[10px] text-white/80">تماس رایگان</div>
            </div>
          </div>

          {/* Quick replies */}
          <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto border-b whitespace-nowrap" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => sendMessage(q.text)}
                className="h-7 px-3 rounded-full border text-[11px] font-bold shrink-0 transition-colors hover:text-dk-red hover:border-dk-red"
                style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={listRef} className="h-80 overflow-y-auto p-3 space-y-2" style={{ background: "var(--bg)" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-5 whitespace-pre-line ${
                    m.from === "user"
                      ? "bg-white border border-dk-border"
                      : "bg-dk-red text-white"
                  }`}
                  style={
                    m.from === "user"
                      ? { background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }
                      : {}
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Rich results after the last bot message */}
            {extra && !typing && (
              <div className="flex justify-end">
                <div className="max-w-[92%] space-y-2">
                  {extra.products && extra.products.length > 0 && (
                    <div className="space-y-2">
                      {extra.products.slice(0, 3).map((p) => (
                        <Link
                          key={p.slug}
                          href={`/product/${p.slug}`}
                          className="flex items-center gap-2.5 p-2 rounded-xl border transition-colors hover:border-dk-red"
                          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl || "/images/placeholder.svg"} alt={p.name} className="w-11 h-11 rounded-lg object-cover shrink-0" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold leading-4 line-clamp-1" style={{ color: "var(--text)" }}>
                              {p.name}
                            </div>
                            <div className="mt-1">
                              <PriceBadge price={p.price} discountPercent={p.discountPercent} compact />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {extra.order && (
                    <div className="p-3 rounded-xl border" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
                      <div className="text-[11px] font-bold mb-1" style={{ color: "var(--text)" }}>
                        سفارش #{extra.order.id.toLocaleString("fa-IR")}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--dk-green, #26a65b)" }}>
                        وضعیت: {extra.order.status}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        مبلغ: {extra.order.total.toLocaleString("fa-IR")} تومان
                      </div>
                    </div>
                  )}

                  {extra.links && extra.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {extra.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="h-7 px-3 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-colors hover:text-dk-red hover:border-dk-red"
                          style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          {l.label} ←
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {typing && (
              <div className="flex justify-end">
                <div className="bg-dk-red text-white px-3 py-2 rounded-xl text-xs">
                  در حال تایپ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor: "var(--border)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="پیام به پشتیبانی"
            />
            <button
              type="button"
              onClick={send}
              disabled={typing}
              className="h-10 px-4 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-50"
              aria-label="ارسال پیام"
            >
              ارسال
            </button>
          </div>
        </div>
      )}
    </>
  );
}
