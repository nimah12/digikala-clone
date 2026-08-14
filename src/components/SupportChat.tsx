"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import PriceBadge from "./PriceBadge";
import { faNormalize } from "@/lib/normalize";

type Message = { from: "user" | "bot"; text: string; at?: string };

// نمایش زمان پیام مثل چت واقعی (ساعت:دقیقه به فارسی)
function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

// برچسب روز برای جداکننده‌های تاریخ — «امروز»، «دیروز» یا تاریخ کامل
function dayLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diff <= 0) return "امروز";
  if (diff === 1) return "دیروز";
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

// زمان نسبی مثل چت واقعی — «همین الان»، «۵ دقیقه پیش»، «۳ ساعت پیش»؛ برای قدیمی‌ترها روز + ساعت
function relativeTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "همین الان";
  if (diffMin < 60) return `${diffMin.toLocaleString("fa-IR")} دقیقه پیش`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour.toLocaleString("fa-IR")} ساعت پیش`;
  // قدیمی‌تر از یک روز: برچسب روز + ساعت دقیق
  const day = dayLabel(iso);
  if (day === "امروز" || day === "دیروز") return `${day}، ${formatTime(iso)}`;
  return `${d.toLocaleDateString("fa-IR", { day: "numeric", month: "long" })}، ${formatTime(iso)}`;
}

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

// دکمه‌های سریع — دقیقاً همان ۴ موضوعی که ربات پشتیبانی پوشش می‌دهد
const QUICK_REPLIES = [
  { label: "پیگیری سفارش", text: "پیگیری سفارشم" },
  { label: "تخفیف‌ها", text: "تخفیف‌ها" },
  { label: "پرفروش‌ترین‌ها", text: "پرفروش‌ترین‌ها" },
  { label: "شرایط مرجوعی", text: "شرایط مرجوعی" },
];

// نام اپراتور + پیام‌های شروع متغیر
// نام اپراتور در هدر چت و پیام خوش‌آمدگویی استفاده می‌شود

function greetingText(): string {
  const h = new Date().getHours();
  const salutation = h >= 5 && h < 12 ? "صبح‌تون بخیر" : h >= 12 && h < 17 ? "ظهر بخیر" : h >= 17 && h < 22 ? "عصرتون بخیر" : "شب بخیر";
  return `${salutation}! اینجا پشتیبانی دیجی‌کلون‌م، من نگار هستم. در این موارد می‌تونم کمکتون کنم: پیگیری سفارش، تخفیف‌ها، پرفروش‌ترین‌ها و شرایط مرجوعی. 😊`;
}

// جملات کوتاه «در حال جستجو» که به‌صورت تصادفی قبل از نتایج ظاهر می‌شوند
const SEARCH_FILLERS = [
  "یه لحظه، دارم براتون چک می‌کنم...",
  "بذارید ببینم چی داریم...",
  "دارم براتون آماده‌ش می‌کنم، چند ثانیه صبر کنید...",
  "براتون پیدا کردم، لحظه‌ای...",
];

function randomFiller(): string {
  return SEARCH_FILLERS[Math.floor(Math.random() * SEARCH_FILLERS.length)];
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: greetingText(), at: new Date().toISOString() },
  ]);
  const [lastSeen, setLastSeen] = useState<string>(() => new Date().toISOString()); // «آخرین بازدید» اپراتور
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // نشانگر «در حال تایپ...»
  const [reveal, setReveal] = useState<string | null>(null); // متن در حال تایپ شدن
  const [extra, setExtra] = useState<{ products?: BotProduct[]; order?: BotResponse["order"]; links?: BotLink[] } | null>(null);
  const [, setTick] = useState(0); // برای آپدیت زنده زمان‌های نسبی
  const tickRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing, reveal, extra, open]);

  // آپدیت زنده برچسب‌های نسبی — هر ۳۰ ثانیه رندر می‌شود تا «۵ دقیقه پیش» به‌موقع به‌روز بماند
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
    }, 30000);
    return () => clearInterval(t);
  }, [open]);

  // زمان «خواندن» پیام کاربر — هرچه پیام طولانی‌تر، بیشتر (مثل آدم واقعی)
  function readingDelay(userText: string): number {
    return Math.min(2000, Math.max(500, 350 + userText.length * 14));
  }

  // مدت «تایپ» پاسخ بر اساس طول پاسخ
  function typingDelay(reply: string): number {
    return Math.min(3200, Math.max(900, 500 + reply.length * 26));
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "user", text: trimmed, at: new Date().toISOString() }]);
    setExtra(null);
    setTyping(true);
    let data: BotResponse | null = null;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: faNormalize(trimmed) }),
      });
      data = (await res.json()) as BotResponse;
    } catch {
      data = { text: "یه مشکل کوچیک پیش اومد، یه بار دیگه تلاش کنید. 🙏" };
    }

    const reply = data.text;
    const fillers = data.products?.length || data.order
      ? " " + randomFiller() + " "
      : "";
    const finalText = reply + fillers;

    // ۱) زمان خواندن پیام کاربر
    await new Promise((r) => setTimeout(r, readingDelay(trimmed)));
    // ۲) مدت تایپ (نشانگر سه‌نقطه)
    await new Promise((r) => setTimeout(r, typingDelay(finalText)));
    // ۳) افکت تایپ تدریجی
    setTyping(false);
    setReveal(finalText);
    const words = finalText.split(" ");
    let shown = "";
    for (let i = 0; i < words.length; i++) {
      shown = words.slice(0, i + 1).join(" ");
      setReveal(shown);
      await new Promise((r) => setTimeout(r, 28 + Math.random() * 40));
    }
    setReveal(null);
    const botAt = new Date().toISOString();
    setMessages((m) => [...m, { from: "bot", text: finalText, at: botAt }]);
    setLastSeen(botAt);
    setExtra({ products: data.products, order: data.order, links: data.links });
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
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">نگار | پشتیبانی دیجی‌کلون</div>
              {typing || reveal ? (
                <div className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-dk-green animate-pulse" />
                  در حال تایپ...
                </div>
              ) : (
                <div className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-dk-green" />
                  آنلاین — آخرین بازدید: {relativeTime(lastSeen ?? new Date().toISOString())}
                </div>
              )}
              <Link
                href="/support"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 hover:bg-white/30 rounded-lg px-2 py-0.5 mt-1 transition-colors"
              >
                <Icon name="mail" size={11} />
                ثبت تیکت
              </Link>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold digits" dir="ltr">
                <Icon name="phonecall" size={13} />
                ۰۲۱-۹۱۰۰۱۰۰۰
              </div>
              <div className="text-[10px] text-white/80">تماس رایگان</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="chat-scroll h-80 overflow-y-auto p-3 space-y-2" style={{ background: "var(--bg)" }}>
            {messages.map((m, i) => {
              // جداکننده روز — مثل چت واقعی قبل از اولین پیام هر روز
              const prev = messages[i - 1];
              const showDay = !prev || dayLabel(prev.at) !== dayLabel(m.at);
              return (
                <div key={i}>
                  {showDay && (
                    <div className="flex items-center gap-2 my-2">
                      <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--text-muted)", background: "var(--panel)" }}>
                        {dayLabel(m.at)}
                      </span>
                      <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    </div>
                  )}
                  <div className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
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
                      {m.at && (
                        <span
                          className={`block mt-1 text-[9px] ${m.from === "user" ? "" : "text-white/70"}`}
                          style={m.from === "user" ? { color: "var(--text-muted)" } : {}}
                        >
                          {relativeTime(m.at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

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

            {/* متن در حال تایپ شدن (افکت تایپ تدریجی) */}
            {reveal && (
              <div className="flex justify-end">
                <div className="bg-dk-red text-white px-3 py-2 rounded-xl text-xs leading-5 whitespace-pre-line">
                  {reveal}
                  <span className="typing-caret" />
                </div>
              </div>
            )}

            {/* نشانگر «در حال تایپ...» سه‌نقطه متحرک */}
            {typing && !reveal && (
              <div className="flex justify-end">
                <div className="bg-dk-red text-white px-3.5 py-2.5 rounded-xl flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies — بالای باکس پیام */}
          <div className="chat-scroll flex items-center gap-2 px-3 py-2 overflow-x-auto border-t whitespace-nowrap" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => sendMessage(q.text)}
                disabled={typing}
                className="h-7 px-3 rounded-full border text-[11px] font-bold shrink-0 transition-colors hover:text-dk-red hover:border-dk-red disabled:opacity-50"
                style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {q.label}
              </button>
            ))}
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
