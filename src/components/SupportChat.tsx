"use client";

import { useEffect, useRef, useState } from "react";

type Message = { from: "user" | "bot"; text: string };

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["ارسال", "تحویل", "پست", "تیپاکس", "گنجه"],
    answer: "ارسال سفارش‌ها با سه روش انجام می‌شه: پست پیشتاز (۳ تا ۵ روز)، تیپاکس (۱ تا ۲ روز) و پیک گنجه در تهران (همان روز). هزینه ارسال در مرحله تسویه حساب انتخاب می‌شه. 🚚",
  },
  {
    keywords: ["بازگشت", "مرجوع", "پس‌داد"],
    answer: "تا ۷ روز بعد از تحویل، اگه از خریدت راضی نبودی می‌تونی کالا رو مرجوع کنی. کالا باید بدون استفاده و با بسته‌بندی اصلی باشه. برای شروع، عدد سفارش رو بهم بگو. ↩️",
  },
  {
    keywords: ["پرداخت", "پول", "درگاه"],
    answer: "در حال حاضر زیرساخت‌های پرداخت فعال نیستن و تیم ما در تلاشه تا هرچه سریع‌تر این مشکل رو حل کنه. به محض فعال شدن، خبر می‌دی‌م. 🙏",
  },
  {
    keywords: ["سبد", "خرید", "سفارش"],
    answer: "برای خرید کافیه محصول موردنظرت رو به سبد اضافه کنی، بعد از تسویه حساب روش ارسال رو انتخاب و اطلاعات گیرنده رو ثبت کنی. مراحل کاملاً راهنمایی می‌شه. 🛒",
  },
  {
    keywords: ["سلام", "درود", "سلامتی", "hi"],
    answer: "سلام! 👋 به پشتیبانی آنلاین دیجی‌کلون خوش اومدی. چطور می‌تونم کمکت کنم؟ می‌تونی درباره ارسال، مرجوعی، پرداخت یا خرید سوال بپرسی.",
  },
  {
    keywords: ["تشکر", "ممنون", "مرسی"],
    answer: "خواهش می‌کنم! 🌟 اگه سوال دیگه‌ای داشتی همیشه در خدمتم.",
  },
];

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  for (const item of FAQ) {
    if (item.keywords.some((k) => lower.includes(k))) return item.answer;
  }
  return "سوالت رو کامل متوجه نشدم 🤔. می‌تونی درباره «ارسال»، «بازگشت کالا»، «پرداخت» یا «خرید» بپرسی یا با شماره ۰۲۱-۹۱۰۰۱۰۰۰ تماس بگیری.";
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "سلام! 👋 به پشتیبانی آنلاین دیجی‌کلون خوش اومدی. چطور می‌تونم کمکت کنم؟" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: getBotReply(text) }]);
      setTyping(false);
    }, 900);
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
          className="fixed bottom-24 left-5 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden"
          style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {/* Header */}
          <div className="bg-dk-red text-white px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🎧</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-dk-green border-2 border-white" />
            </div>
            <div>
              <div className="text-sm font-bold">پشتیبانی دیجی‌کلون</div>
              <div className="text-[11px] text-white/80">آنلاین — پاسخگویی فوری</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="h-72 overflow-y-auto p-3 space-y-2" style={{ background: "var(--bg)" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-5 ${
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
              className="h-10 px-4 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
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
