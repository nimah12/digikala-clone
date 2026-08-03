"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bg: string;
  accent: string;
  emoji: string;
  href: string;
  stats: string;
};

const SLIDES: Slide[] = [
  {
    id: "deals",
    title: "تخفیف‌های شگفت‌انگیز",
    subtitle: "تا ٤٠٪ تخفیف روی کالای دیجیتال، فقط برای مدت محدود",
    badge: "تا ٤٠٪ تخفیف",
    bg: "#ef4050",
    accent: "#ff7b5a",
    emoji: "🎉",
    href: "/search?q=",
    stats: "۱۲ کالای منتخب با تخفیف ویژه",
  },
  {
    id: "laptop",
    title: "لپ‌تاپ‌های حرفه‌ای",
    subtitle: "مک‌بوک و ویندوزی با ضمانت اصالت کالا",
    badge: "ضمانت اصالت",
    bg: "#23254e",
    accent: "#4a4fa8",
    emoji: "💻",
    href: "/category/laptop",
    stats: "مک‌بوک ایر M3 از ۷۲ میلیون تومان",
  },
  {
    id: "smartwatch",
    title: "ساعت‌های هوشمند",
    subtitle: "اپل واچ و گلکسی واچ با بهترین قیمت",
    badge: "جدیدترین مدل‌ها",
    bg: "#7879f1",
    accent: "#9a9bff",
    emoji: "⌚",
    href: "/category/smartwatch",
    stats: "اپل واچ سری ۹ و گلکسی واچ ۶",
  },
  {
    id: "audio",
    title: "هدفون و اسپیکر",
    subtitle: "تجربه صدای بی‌نظیر با جدیدترین محصولات صوتی",
    badge: "ارسال رایگان",
    bg: "#0e7a5f",
    accent: "#1a9c7b",
    emoji: "🎧",
    href: "/category/audio",
    stats: "سونی XM5 و ایرپادز پرو ۲",
  },
  {
    id: "gold",
    title: "طلا و نقره اصل",
    subtitle: "خرید مطمئن طلا با ضمانت اصالت و عیار تضمینی",
    badge: "عیار تضمینی",
    bg: "#b8860b",
    accent: "#d4a017",
    emoji: "🥇",
    href: "/category/gold-silver",
    stats: "قیمت روز طلا و سکه",
  },
];

const SLIDE_MS = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((i: number) => {
    setCurrent((i + SLIDES.length) % SLIDES.length);
  }, []);

  // auto-advance every 5 seconds + progress bar
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      setProgress(Math.min(100, (elapsed / SLIDE_MS) * 100));
    }, 50);
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [paused, current]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="بنرهای تبلیغاتی"
    >
      {/* Slides */}
      <div className="relative min-h-[320px] md:min-h-[420px]">
        {SLIDES.map((slide, i) => (
          <Link
            key={slide.id}
            href={slide.href}
            className={`w-full min-h-[320px] md:min-h-[420px] flex flex-col justify-center p-8 md:p-14 transition-all duration-700 ease-out ${
              i === current ? "opacity-100 relative" : "opacity-0 absolute pointer-events-none"
            }`}
            style={{ background: `linear-gradient(120deg, ${slide.bg} 0%, ${slide.accent} 100%)`, inset: 0 }}
            aria-hidden={i !== current}
          >
            {/* Large decorative emoji */}
            <span className={`absolute -top-6 -left-6 text-[140px] md:text-[200px] opacity-15 select-none transition-transform duration-700 ${i === current ? "scale-100 rotate-0" : "scale-90"}`}>
              {slide.emoji}
            </span>
            {/* Decorative circles */}
            <span className="absolute top-10 right-16 w-24 h-24 rounded-full bg-white/10 hidden md:block" />
            <span className="absolute bottom-8 right-40 w-14 h-14 rounded-full bg-white/10 hidden md:block" />

            <div className="relative max-w-xl space-y-4">
              {/* Badge */}
              <span className={`inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full ${i === current ? "pop-in" : ""}`}>
                ✨ {slide.badge}
              </span>
              {/* Title */}
              <h2 className="text-white text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              {/* Subtitle */}
              <p className="text-white/85 text-sm md:text-lg leading-7">
                {slide.subtitle}
              </p>
              {/* Stats + CTA */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <span className="inline-flex items-center gap-1.5 bg-white text-dk-text text-xs font-bold px-4 py-2 rounded-lg shadow-md group-hover:scale-105 group-hover:bg-white transition-all">
                  مشاهده
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </span>
                <span className="text-white/70 text-[11px]">{slide.stats}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => goTo(current - 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-dk-text shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="اسلاید قبلی"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo(current + 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-dk-text shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="اسلاید بعدی"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Dots + progress */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            className="relative h-2.5 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: i === current ? "28px" : "10px", background: i === current ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)" }}
            aria-label={`اسلاید ${i + 1}`}
          >
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
