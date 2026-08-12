"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type MediaItem = {
  id: number;
  url: string;
  type: string; // "image" | "video"
};

type Props = {
  mainImageUrl: string | null;
  media: MediaItem[];
  productName: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function fa(n: number): string {
  return n.toLocaleString("fa-IR");
}

export default function ProductGallery({ mainImageUrl, media, productName }: Props) {
  // آیتم اصلی (imageUrl قدیمی) رو به‌عنوان اولین آیتم گالری در نظر می‌گیریم،
  // مگر اینکه همون آدرس از قبل توی گالری جدید هم باشه.
  const items: MediaItem[] = [];
  if (mainImageUrl && !media.some((m) => m.url === mainImageUrl)) {
    items.push({ id: -1, url: mainImageUrl, type: "image" });
  }
  items.push(...media);

  const [selected, setSelected] = useState(0);

  // ----- Lightbox state -----
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scale, setScale] = useState(MIN_SCALE);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const zoomRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const clampPos = useCallback((x: number, y: number, s: number) => {
    const boundX = (s - 1) * window.innerWidth;
    const boundY = (s - 1) * window.innerHeight;
    return { x: clamp(x, -boundX, boundX), y: clamp(y, -boundY, boundY) };
  }, []);

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setPos({ x: 0, y: 0 });
  }, []);

  // بزرگ‌نمایی نسبت به یک نقطه (مثلاً مرکز صفحه یا محل مکان‌نما)
  const zoomTo = useCallback((target: number, px?: number, py?: number) => {
    const cur = scaleRef.current;
    const next = clamp(target, MIN_SCALE, MAX_SCALE);
    if (next === MIN_SCALE) {
      setPos({ x: 0, y: 0 });
      setScale(next);
      return;
    }
    const cx = px ?? window.innerWidth / 2;
    const cy = py ?? window.innerHeight / 2;
    const ratio = next / cur;
    setPos((p) => {
      const np = { x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio };
      return clampPos(np.x, np.y, next);
    });
    setScale(next);
  }, [clampPos]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    resetZoom();
    setOpen(true);
  }, [resetZoom]);

  const closeLightbox = useCallback(() => {
    setOpen(false);
    resetZoom();
    setDragging(false);
    dragRef.current = null;
  }, [resetZoom]);

  const go = useCallback((delta: number) => {
    resetZoom();
    setLightboxIndex((i) => (i + delta + items.length) % items.length);
  }, [items.length, resetZoom]);

  // قفل اسکرول صفحه + پشتیبانی از کیبورد هنگام باز بودن لایت‌باکس
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        go(-1);
      } else if (e.key === "ArrowLeft") {
        go(1);
      } else if (e.key === "+" || e.key === "=") {
        zoomTo(scaleRef.current * 1.5);
      } else if (e.key === "-") {
        zoomTo(scaleRef.current / 1.5);
      } else if (e.key === "0") {
        resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items.length, closeLightbox, go, zoomTo, resetZoom]);

  // بزرگ‌نمایی با اسکرول ماوس (غیر-passive تا بتوانیم اسکرول صفحه را متوقف کنیم)
  useEffect(() => {
    if (!open) return;
    const node = zoomRef.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const next = clamp(scaleRef.current * factor, MIN_SCALE, MAX_SCALE);
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const ratio = next / scaleRef.current;
      const cur = scaleRef.current;
      if (next === MIN_SCALE) {
        setPos({ x: 0, y: 0 });
      } else {
        setPos((p) => {
          const np = {
            x: mx - (mx - p.x) * ratio,
            y: my - (my - p.y) * ratio,
          };
          return clampPos(np.x, np.y, next);
        });
      }
      if (cur !== next) setScale(next);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [open, clampPos]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scaleRef.current <= MIN_SCALE) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const s = scaleRef.current;
    const np = clampPos(d.origX + (e.clientX - d.startX), d.origY + (e.clientY - d.startY), s);
    setPos(np);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const cur = scaleRef.current;
    if (cur > MIN_SCALE) {
      resetZoom();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      zoomTo(2.5, e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="relative aspect-square rounded-xl overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <Image
          src="/images/placeholder.svg"
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  const current = items[selected] ?? items[0];
  const lightboxItem = items[lightboxIndex] ?? items[0];
  const isZoomed = scale > MIN_SCALE;

  return (
    <div className="flex flex-col gap-3">
      {/* نمایشگر اصلی */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden group cursor-zoom-in"
        style={{ background: "var(--bg)" }}
        onClick={() => openLightbox(selected)}
      >
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <Image
              src={current.url}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 text-white text-xs font-bold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
              </svg>
              بزرگ‌نمایی
            </span>
          </>
        )}
      </div>

      {/* ردیف thumbnail ها */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={item.id === -1 ? `main-${i}` : item.id}
              type="button"
              onClick={() => {
                setSelected(i);
                openLightbox(i);
              }}
              className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition"
              style={{
                borderColor: i === selected ? "var(--dk-red, #ef4050)" : "var(--border)",
                background: "var(--bg)",
              }}
              aria-label={`نمایش رسانه ${i + 1}`}
            >
              {item.type === "video" ? (
                <>
                  <video src={item.url} className="w-full h-full object-cover" muted />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ----- Lightbox: پس‌زمینه مشکی تمام‌صفحه ----- */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 select-none"
          role="dialog"
          aria-modal="true"
          aria-label={productName}
        >
          {/* بستن */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 left-4 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="بستن"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* شمارنده */}
          <div className="absolute top-5 right-1/2 translate-x-1/2 z-20 rounded-full bg-white/10 text-white text-sm font-bold px-4 py-1.5">
            {fa(lightboxIndex + 1)} / {fa(items.length)}
          </div>

          {/* تصویر قبلی */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="تصویر قبلی"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}

          {/* تصویر بعدی */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="تصویر بعدی"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* ناحیه تصویر */}
          <div
            ref={zoomRef}
            className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
            onDoubleClick={onDoubleClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ cursor: isZoomed ? (dragging ? "grabbing" : "grab") : "zoom-in", touchAction: isZoomed ? "none" : undefined }}
          >
            {lightboxItem.type === "video" ? (
              <video
                key={lightboxItem.url}
                src={lightboxItem.url}
                controls
                autoPlay
                className="max-h-full max-w-full"
              />
            ) : (
              <div
                className="relative h-full w-full"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                  transformOrigin: "0 0",
                }}
              >
                <Image
                  src={lightboxItem.url}
                  alt={productName}
                  fill
                  draggable={false}
                  sizes="100vw"
                  className="object-contain"
                  style={{ pointerEvents: "none" }}
                />
              </div>
            )}
          </div>

          {/* کنترل زوم */}
          {lightboxItem.type !== "video" && (
            <div className="absolute bottom-5 right-1/2 translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white">
              <button
                type="button"
                onClick={() => zoomTo(scaleRef.current / 1.5)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                aria-label="کوچک‌نمایی"
                disabled={scale <= MIN_SCALE}
                style={{ opacity: scale <= MIN_SCALE ? 0.4 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>

              <span className="min-w-[3.5rem] text-center text-sm font-bold tabular-nums">
                ٪{fa(Math.round(scale * 100))}
              </span>

              <button
                type="button"
                onClick={() => zoomTo(scaleRef.current * 1.5)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                aria-label="بزرگ‌نمایی"
                disabled={scale >= MAX_SCALE}
                style={{ opacity: scale >= MAX_SCALE ? 0.4 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>

              <button
                type="button"
                onClick={resetZoom}
                className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/25 transition-colors text-xs font-bold"
                aria-label="بازنشانی زوم"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                بازنشانی
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
