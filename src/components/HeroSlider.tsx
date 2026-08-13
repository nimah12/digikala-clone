"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type HeroProduct = {
  name: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  categoryName: string;
};

export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  stats: string;
  href: string;
  theme: "deals" | "laptop" | "smartwatch" | "audio" | "gold";
  product: HeroProduct | null;
};

const THEMES: Record<
  HeroSlide["theme"],
  { bg: string; glow: string; blob1: string; blob2: string }
> = {
  deals: {
    bg: "linear-gradient(130deg, #ef4050 0%, #c2273f 55%, #70102a 100%)",
    glow: "rgba(255,92,108,0.55)",
    blob1: "rgba(255,120,140,0.4)",
    blob2: "rgba(255,60,90,0.3)",
  },
  laptop: {
    bg: "linear-gradient(130deg, #141a3c 0%, #23254e 52%, #3d42a0 100%)",
    glow: "rgba(90,110,255,0.5)",
    blob1: "rgba(100,120,255,0.35)",
    blob2: "rgba(60,70,210,0.3)",
  },
  smartwatch: {
    bg: "linear-gradient(130deg, #2a1f6e 0%, #5b2fce 52%, #8a3ff0 100%)",
    glow: "rgba(170,110,255,0.5)",
    blob1: "rgba(180,130,255,0.35)",
    blob2: "rgba(120,60,220,0.3)",
  },
  audio: {
    bg: "linear-gradient(130deg, #052e22 0%, #0e7a5f 52%, #16b389 100%)",
    glow: "rgba(46,230,171,0.5)",
    blob1: "rgba(60,230,180,0.32)",
    blob2: "rgba(20,160,127,0.28)",
  },
  gold: {
    bg: "linear-gradient(130deg, #3d2a06 0%, #8a6210 52%, #d9a822 100%)",
    glow: "rgba(255,209,102,0.5)",
    blob1: "rgba(255,214,120,0.35)",
    blob2: "rgba(212,160,23,0.3)",
  },
};

const SLIDE_MS = 6000;

/** زمان باقی‌مانده تا پایان امروز (برای اسلاید تخفیف‌ها) */
function useTimeToMidnight() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const secs = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    return {
      h: Math.floor(secs / 3600),
      m: Math.floor((secs % 3600) / 60),
      s: secs % 60,
    };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return left;
}

function pad2(n: number) {
  return n.toLocaleString("fa-IR", { minimumIntegerDigits: 2 });
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const countdown = useTimeToMidnight();

  const goTo = useCallback((i: number) => {
    setCurrent((i + slides.length) % slides.length);
  }, [slides.length]);

  // پیشرفت + تغییر خودکار اسلاید
  useEffect(() => {
    if (paused) return;
    const start = performance.now();
    const interval = setInterval(() => {
      setProgress(Math.min(100, ((performance.now() - start) / SLIDE_MS) * 100));
    }, 50);
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_MS);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [paused, slides.length]);

  useEffect(() => {
    setProgress(0);
  }, [current]);

  const slide = slides[current];
  const theme = THEMES[slide.theme];
  const p = slide.product;

  return (
    <section
      className="relative overflow-hidden rounded-3xl shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="بنرهای تبلیغاتی"
    >
      {/* لایه‌ها */}
      <div className="relative min-h-[430px] md:min-h-[480px]">
        {slides.map((s, i) => {
          const t = THEMES[s.theme];
          return (
            <div
              key={s.id}
              aria-hidden={i !== current}
              className={`w-full min-h-[430px] md:min-h-[480px] flex items-center overflow-hidden transition-opacity duration-700 ${
                i === current ? "opacity-100 relative" : "opacity-0 absolute pointer-events-none"
              }`}
              style={{ background: t.bg, inset: 0 }}
            >
              {/* نقطه‌چین پس‌زمینه */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.09) 1.2px, transparent 1.2px)",
                  backgroundSize: "26px 26px",
                }}
              />
              {/* حباب‌های رنگی متحرک */}
              <span
                className="hero-blob absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl"
                style={{ background: t.blob1 }}
              />
              <span
                className="hero-blob absolute -bottom-28 -left-20 w-96 h-96 rounded-full blur-3xl"
                style={{ background: t.blob2, animationDelay: "-8s" }}
              />
              {/* هاله نرم دور محتوا */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 22% 50%, rgba(255,255,255,0.10) 0%, transparent 60%)",
                }}
              />

              <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                {/* متن */}
                <div className="space-y-4 md:space-y-5 py-8 md:py-10 text-center md:text-right">
                  <div className={i === current ? "hero-slide-up" : "opacity-0"} style={{ animationDelay: "0ms" }}>
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {s.badge}
                    </span>
                  </div>

                  <h2
                    className={`text-white text-3xl sm:text-4xl md:text-5xl font-black leading-[1.25] drop-shadow-[0_4px_18px_rgba(0,0,0,0.25)] ${
                      i === current ? "hero-slide-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "90ms" }}
                  >
                    {s.title}
                  </h2>

                  <p
                    className={`text-white/85 text-sm md:text-base leading-7 max-w-md mx-auto md:mx-0 ${
                      i === current ? "hero-slide-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "180ms" }}
                  >
                    {s.subtitle}
                  </p>

                  {/* دکمه‌ها */}
                  <div
                    className={`flex items-center justify-center md:justify-start gap-3 pt-1 ${
                      i === current ? "hero-slide-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "270ms" }}
                  >
                    <Link
                      href={s.href}
                      className="group inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-extrabold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.04] active:scale-95 overflow-hidden relative"
                    >
                      <span className="hero-shine absolute inset-0 bg-gradient-to-l from-transparent via-white/60 to-transparent pointer-events-none" />
                      <span className="relative">مشاهده محصولات</span>
                      <svg
                        className="relative w-4 h-4 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </Link>
                    <Link
                      href={s.href}
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-sm font-bold px-5 py-3 rounded-full border border-white/25 hover:bg-white/20 transition-all hover:scale-[1.04] active:scale-95"
                    >
                      جزئیات بیشتر
                    </Link>
                  </div>

                  <p
                    className={`text-white/70 text-xs flex items-center justify-center md:justify-start gap-1.5 ${
                      i === current ? "hero-slide-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: "360ms" }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    {s.stats}
                  </p>
                </div>

                {/* عکس محصول شناور */}
                <div className={`hidden md:flex items-center justify-center ${i === current ? "hero-pop" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
                  <div className="relative">
                    {/* هاله درخشان */}
                    <div
                      className="absolute -inset-8 rounded-full blur-3xl opacity-50"
                      style={{ background: t.glow }}
                    />
                    {p?.imageUrl ? (
                      <>
                        <Link
                          href={s.href}
                          className="hero-float relative block w-64 lg:w-72 bg-white/95 backdrop-blur rounded-3xl p-3.5 shadow-2xl ring-1 ring-white/40"
                        >
                          <div className="relative overflow-hidden rounded-2xl">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className={`w-full aspect-square object-contain ${i === current ? "hero-kenburns" : ""}`}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-3 px-1">
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-500 truncate">{p.name}</p>
                              <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap">
                                {formatPrice(p.price)}
                                <span className="text-[10px] font-medium text-gray-400"> تومان</span>
                              </p>
                            </div>
                            <span className="shrink-0 bg-dk-red text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
                              ٪{p.discountPercent.toLocaleString("fa-IR")}
                            </span>
                          </div>
                          {/* درخشش روی کارت */}
                          <span className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <span className="hero-shine absolute inset-y-0 w-1/2 bg-gradient-to-l from-transparent via-white/50 to-transparent" />
                          </span>
                        </Link>

                        {/* چیپ‌های شناور */}
                        <span className="hero-float-delayed absolute -top-4 -right-5 bg-white/95 backdrop-blur text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <span className="text-dk-green">✓</span> ضمانت اصالت
                        </span>
                        <span className="hero-float-delayed absolute -bottom-4 -left-5 bg-white/95 backdrop-blur text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <span className="text-dk-red">🚚</span> ارسال رایگان
                        </span>
                      </>
                    ) : (
                      <div className="w-64 lg:w-72 aspect-square rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white/50 text-sm">
                        {s.badge}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* کان‌داون — فقط روی اسلاید تخفیف‌ها */}
        {slide.theme === "deals" && (
          <div className="absolute top-4 left-4 md:top-6 md:left-10 z-10">
            <div className="hero-slide-up flex items-center gap-1.5 bg-black/25 backdrop-blur rounded-2xl px-3.5 py-2.5 border border-white/20 shadow-lg" key={`cd-${current}`}>
              <span className="text-white/80 text-[10px] font-bold ml-1">پایان تخفیف‌ها تا</span>
              {[
                { v: pad2(countdown.h), l: "ساعت" },
                { v: pad2(countdown.m), l: "دقیقه" },
                { v: pad2(countdown.s), l: "ثانیه" },
              ].map((unit, idx) => (
                <span key={unit.l} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-white/40 font-black">:</span>}
                  <span className="min-w-8 text-center bg-white/15 text-white text-sm font-black rounded-lg px-1.5 py-1 tabular-nums">
                    {unit.v}
                  </span>
                  <span className="text-white/60 text-[9px]">{unit.l}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* فلش‌ها */}
      <button
        type="button"
        onClick={() => goTo(current - 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        aria-label="اسلاید قبلی"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo(current + 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        aria-label="اسلاید بعدی"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* نقطه‌ها + شمارنده */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            className="relative h-2.5 rounded-full overflow-hidden transition-all duration-300"
            style={{
              width: i === current ? "30px" : "10px",
              background: i === current ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.55)",
            }}
            aria-label={`اسلاید ${i + 1}`}
          >
            {i === current && (
              <span
                className="absolute inset-y-0 right-0 bg-white rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* شماره اسلاید */}
      <div className="absolute bottom-4 left-4 md:left-8 z-10 text-white/70 text-[11px] font-bold tracking-widest select-none">
        {(current + 1).toLocaleString("fa-IR")} / {slides.length.toLocaleString("fa-IR")}
      </div>
    </section>
  );
}
