"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { getCurrentUser, isDemoUser } from "@/lib/user";
import { useHydrated } from "@/lib/hydration";
import { getProvinceNames, getCities } from "@/lib/provinces";
import { pushEvent } from "@/lib/notifications";
import { showToast } from "./Toast";
import Icon, { type IconName } from "./Icon";
import LocationSelect from "./LocationSelect";

export type ShippingMethod = {
  id: string;
  name: string;
  desc: string;
  price: number;
  eta: string;
  icon: IconName;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "express",
    name: "پیک گنجه",
    desc: "ارسال در همان روز در تهران",
    price: 30000,
    eta: "امروز",
    icon: "bolt",
  },
  {
    id: "tipax",
    name: "تیپاکس",
    desc: "ارسال سریع به سراسر کشور",
    price: 120000,
    eta: "۱ تا ۲ روز",
    icon: "truck",
  },
  {
    id: "post",
    name: "پست پیشتاز",
    desc: "ارسال اقتصادی با پست",
    price: 120000,
    eta: "۲ تا ۳ روز",
    icon: "mail",
  },
];

// ارسال رایگان برای استان‌های تهران و البرز (به‌همراه زیرمجموعه‌ها مثل کرج)
export const FREE_SHIPPING_PROVINCES = ["تهران", "البرز"];

export function getShippingPrice(method: ShippingMethod, province: string): number {
  if (FREE_SHIPPING_PROVINCES.includes(province)) return 0;
  return method.price;
}

export const DELIVERY_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export const DELIVERY_SLOTS = ["۹ تا ۱۲", "۱۲ تا ۱۵", "۱۵ تا ۱۸", "۱۸ تا ۲۱"];

type Gateway = "shaparak" | "sadad";

const GATEWAYS: { key: Gateway; name: string }[] = [
  { key: "shaparak", name: "شاپرک" },
  { key: "sadad", name: "سداد" },
];

function formatCardNumber(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}

function formatExpiry(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

type PreviousReceiver = {
  label: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
};

// آدرس ذخیره‌شده به شکل «استان، شهرستان، آدرس — تحویل: ...» است؛
// استان و شهرستان را از ابتدا جدا کرده و بقیه را آدرس در نظر می‌گیریم.
function parseReceiverAddress(raw: string): { province: string; city: string; address: string } {
  let addr = raw || "";
  const dlv = addr.indexOf(" — تحویل:");
  if (dlv >= 0) addr = addr.slice(0, dlv);
  const parts = addr.split("،");
  return {
    province: parts[0]?.trim() || "",
    city: parts[1]?.trim() || "",
    address: parts.slice(2).join("،").trim(),
  };
}

export default function CheckoutForm({ subtotal }: { subtotal: number }) {
  const hydrated = useHydrated();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState<ShippingMethod>(SHIPPING_METHODS[1]);
  const [deliveryDay, setDeliveryDay] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [gateway, setGateway] = useState<Gateway>("shaparak");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", cvv2: "", exp: "" });
  const [captcha, setCaptcha] = useState("");
  const [captchaNum, setCaptchaNum] = useState(() => Math.floor(10000 + Math.random() * 90000));
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    city: "",
  });
  const [orderError, setOrderError] = useState("");
  const [saving, setSaving] = useState(false);
  const [prevReceivers, setPrevReceivers] = useState<PreviousReceiver[]>([]);
  const fetchedPrevRef = useRef(false);
  const router = useRouter();

  // در گام اطلاعات گیرنده، آدرس‌های قبلی کاربر را برای انتخاب به‌عنوان پیش‌فرض بارگذاری کن
  useEffect(() => {
    if (step !== 2 || fetchedPrevRef.current) return;
    const user = getCurrentUser();
    if (!user) return;
    // کاربر دمو نباید آدرس‌های سفارش‌های قبلی (اغلب تستی) را ببیند؛ بقیه کاربران استفاده می‌کنند
    if (isDemoUser(user)) {
      fetchedPrevRef.current = true;
      return;
    }
    const token = localStorage.getItem("dk-token");
    fetch("/api/orders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          const seen = new Set<string>();
          const list: PreviousReceiver[] = [];
          for (const o of d.data) {
            if (!o?.receiverName || !o?.phone) continue;
            const { province, city, address } = parseReceiverAddress(o.address || "");
            if (!province || !city) continue;
            const key = `${o.receiverName}|${o.phone}|${province}|${city}|${address}`;
            if (seen.has(key)) continue;
            seen.add(key);
            list.push({
              label: `${o.receiverName} — ${province}، ${city}`,
              name: o.receiverName,
              phone: o.phone,
              province,
              city,
              address,
            });
          }
          setPrevReceivers(list);
        }
        fetchedPrevRef.current = true;
      })
      .catch(() => {
        fetchedPrevRef.current = true;
      });
  }, [step]);

  const isFreeShipping = getShippingPrice(shipping, form.province) === 0;
  const shippingPrice = getShippingPrice(shipping, form.province);
  const total = subtotal + shippingPrice;

  function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.province ||
      !form.city ||
      !form.address.trim()
    )
      return;
    setStep(3);
  }

  function cardValid(): boolean {
    const digits = cardForm.number.replace(/\D/g, "");
    return (
      digits.length === 16 &&
      cardForm.cvv2.replace(/\D/g, "").length >= 3 &&
      cardForm.exp.replace(/\D/g, "").length === 4 &&
      parseInt(captcha, 10) === captchaNum
    );
  }

  async function saveOrder(): Promise<number | null> {
    const user = getCurrentUser();
    if (!user?.email) {
      setOrderError("ابتدا وارد حساب کاربری خود شوید.");
      return null;
    }
    setOrderError("");
    setSaving(true);
    try {
      const cart = localStorage.getItem("dk-cart");
      const items: {
        id: number;
        qty: number;
        colorName?: string;
        colorHex?: string;
        sizeName?: string;
      }[] = cart ? JSON.parse(cart) : [];
      if (items.length === 0) {
        setOrderError("سبد خرید شما خالی است.");
        return null;
      }
      const productIds: number[] = [];
      const quantities: number[] = [];
      const colorNames: (string | null)[] = [];
      const colorHexes: (string | null)[] = [];
      const sizeNames: (string | null)[] = [];
      for (const item of items) {
        productIds.push(item.id);
        quantities.push(item.qty || 1);
        colorNames.push(item.colorName ?? null);
        colorHexes.push(item.colorHex ?? null);
        sizeNames.push(item.sizeName ?? null);
      }
      const token = localStorage.getItem("dk-token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: user.email,
          total,
          shippingName: shipping.name,
          shippingPrice,
          receiverName: form.name,
          phone: form.phone,
          address: `${form.province}، ${form.city}، ${form.address}`,
          deliveryDay,
          deliverySlot,
          productIds,
          quantities,
          colorNames,
          colorHexes,
          sizeNames,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setOrderError(
          data?.error || "ثبت سفارش با خطا مواجه شد. دوباره تلاش کنید.",
        );
        return null;
      }
      localStorage.removeItem("dk-cart");
      window.dispatchEvent(new Event("dk-cart-changed"));
      // نوتیفیکیشن ثبت موفق سفارش
      pushEvent({
        type: "order",
        title: "سفارش شما ثبت شد",
        description: "سفارش شما ثبت شد و پس از تایید توسط فروشگاه آماده‌سازی می‌شود.",
        href: `/orders/${data.orderId}`,
      });
      showToast({
        title: "سفارش شما ثبت شد",
        description: `سفارش #${data.orderId} ثبت شد و در انتظار تایید فروشگاه است.`,
        href: `/orders/${data.orderId}`,
      });
      return data.orderId as number;
    } catch {
      setOrderError("خطا در اتصال به سرور. دوباره تلاش کنید.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handlePay() {
    if (!cardValid()) {
      setOrderError("لطفاً اطلاعات کارت را کامل وارد کنید (شماره ۱۶ رقمی، رمز دوم، تاریخ انقضا و کد امنیتی).");
      return;
    }
    setOrderError("");
    setPaying(true);
    // شبیه‌سازی اتصال به درگاه
    await new Promise((r) => setTimeout(r, 1800));
    setPaying(false);
    setPaid(true);
    const orderId = await saveOrder();
    if (orderId) {
      setTimeout(() => router.push(`/track-order?order=${orderId}`), 1200);
    } else {
      setPaid(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 md:p-6"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { n: 1, label: "روش ارسال" },
          { n: 2, label: "اطلاعات گیرنده" },
          { n: 3, label: "پرداخت" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= s.n ? "bg-dk-red text-white" : "border"
              }`}
              style={
                step < s.n
                  ? {
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }
                  : {}
              }
            >
              {step > s.n ? "✓" : s.n.toLocaleString("fa-IR")}
            </div>
            <span
              className={`text-xs ${step >= s.n ? "font-bold" : ""}`}
              style={{
                color: step >= s.n ? "var(--text)" : "var(--text-secondary)",
              }}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: shipping */}
      {step === 1 && (
        <div>
          <h2 className="text-sm font-extrabold mb-1">
            روش ارسال سفارش را انتخاب کنید
          </h2>
          <div
            className="flex items-center gap-2 mb-4 p-2.5 rounded-lg text-[11px] font-bold"
            style={{ background: "rgba(249,168,37,0.12)", color: "var(--text)" }}
          >
            <Icon name="truck" size={15} />
            ارسال رایگان برای ساکنین استان‌های تهران و البرز (کرج)
          </div>
          <div className="space-y-3">
            {SHIPPING_METHODS.map((m) => {
              const free = getShippingPrice(m, form.province) === 0;
              return (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    shipping.id === m.id ? "ring-2 ring-dk-red" : ""
                  }`}
                  style={{
                    borderColor:
                      shipping.id === m.id
                        ? "var(--dk-red, #ef4050)"
                        : "var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping.id === m.id}
                    onChange={() => setShipping(m)}
                    className="accent-[#ef4050]"
                  />
                  <span className="text-dk-red">
                    <Icon name={m.icon} size={22} />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{m.name}</div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {m.desc}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className={`text-sm font-bold digits ${free ? "text-dk-green" : ""}`}>
                      {free ? "رایگان" : formatPrice(m.price)}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {m.eta}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2">
              <Icon name="calendar" size={16} className="text-dk-red" />
              روز تحویل را انتخاب کنید
            </h3>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeliveryDay(d)}
                  className="h-9 px-4 rounded-full border text-xs font-bold transition-all"
                  style={
                    deliveryDay === d
                      ? { background: "var(--text)", color: "var(--panel)", borderColor: "var(--text)" }
                      : { background: "var(--bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2">
              <Icon name="clock" size={16} className="text-dk-red" />
              بازه زمانی تحویل
            </h3>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDeliverySlot(s)}
                  className="h-9 px-4 rounded-full border text-xs font-bold transition-all"
                  style={
                    deliverySlot === s
                      ? { background: "var(--text)", color: "var(--panel)", borderColor: "var(--text)" }
                      : { background: "var(--bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!deliveryDay || !deliverySlot}
            onClick={() => setStep(2)}
            className="mt-6 w-full h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ادامه و ثبت اطلاعات
          </button>
          {(!deliveryDay || !deliverySlot) && (
            <p className="mt-2 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
              لطفاً روز و بازه تحویل را انتخاب کنید
            </p>
          )}
        </div>
      )}

      {/* Step 2: receiver info */}
      {step === 2 && (
        <form onSubmit={submitInfo}>
          <h2 className="text-sm font-extrabold mb-4">اطلاعات گیرنده</h2>

          {prevReceivers.length > 0 && (
            <div
              className="mb-4 p-3 rounded-xl border"
              style={{ background: "rgba(120,121,241,0.08)", borderColor: "var(--border)" }}
            >
              <label className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
                <Icon name="return" size={14} className="text-dk-red" />
                از اطلاعات سفارش قبلی خود استفاده کنید
              </label>
              <select
                value=""
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  if (Number.isNaN(idx) || idx < 0 || !prevReceivers[idx]) return;
                  const r = prevReceivers[idx];
                  setForm({
                    name: r.name,
                    phone: r.phone,
                    address: r.address,
                    province: r.province,
                    city: r.city,
                  });
                }}
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <option value="">انتخاب کنید یا اطلاعات جدید وارد کنید</option>
                {prevReceivers.map((r, i) => (
                  <option key={i} value={i}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثلاً: علی محمدی"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LocationSelect
                label="استان"
                placeholder="انتخاب استان"
                options={getProvinceNames()}
                value={form.province}
                onChange={(province) =>
                  setForm({ ...form, province, city: "" })
                }
              />
              <LocationSelect
                label="شهرستان"
                placeholder={form.province ? "انتخاب شهرستان" : "ابتدا استان"}
                options={form.province ? getCities(form.province) : []}
                value={form.city}
                onChange={(city) => setForm({ ...form, city })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">
                آدرس کامل
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="نشانی پستی کامل گیرنده..."
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                required
              />
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-lg text-xs flex items-center justify-between"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              هزینه ارسال ({shipping.name})
            </span>
            <span className={`font-bold ${isFreeShipping ? "text-dk-green" : ""}`}>
              {isFreeShipping ? "رایگان" : formatPrice(shippingPrice)}
            </span>
          </div>
          {isFreeShipping && (
            <div
              className="mt-2 p-3 rounded-lg text-[11px] font-bold"
              style={{ background: "rgba(38,166,91,0.12)", color: "var(--text)" }}
            >
              <Icon name="check" size={13} className="inline-block ml-1" />
              ارسال به {form.province} رایگان است
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-5 rounded-lg border text-sm font-bold transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              بازگشت
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
            >
              ادامه و پرداخت
            </button>
          </div>
        </form>
      )}

      {/* Step 3: demo payment */}
      {step === 3 && !paid && (
        <div>
          <h2 className="text-sm font-extrabold mb-4">پرداخت آنلاین (دمو)</h2>

          <div
            className="mb-4 p-4 rounded-xl border space-y-2 text-sm"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>مبلغ کالاها</span>
              <span className="digits font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>
                هزینه ارسال ({shipping.name})
              </span>
              <span className={`digits font-bold ${isFreeShipping ? "text-dk-green" : ""}`}>
                {isFreeShipping ? "رایگان" : formatPrice(shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>روز و بازه تحویل</span>
              <span>
                {deliveryDay}، {deliverySlot}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between" style={{ borderColor: "var(--border)" }}>
              <span className="font-extrabold">مبلغ قابل پرداخت</span>
              <span className="font-extrabold text-dk-red digits">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold mb-2">انتخاب درگاه پرداخت</label>
            <div className="grid grid-cols-2 gap-2">
              {GATEWAYS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGateway(g.key)}
                  className="h-11 rounded-lg border text-sm font-bold transition-all"
                  style={
                    gateway === g.key
                      ? { background: "#ef4050", color: "#fff", borderColor: "#ef4050" }
                      : { background: "var(--bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }
                  }
                >
                  {g.name}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              این درگاه صرفاً جنبه نمایشی دارد و هیچ تراکنشی انجام نمی‌شود.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                شماره کارت
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                placeholder="0000-0000-0000-0000"
                className="w-full h-10 px-3 rounded-lg border text-sm digits text-left focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">
                کد امنیتی
              </label>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-lg font-extrabold select-none min-w-[70px]"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    fontStyle: "italic",
                    letterSpacing: "0.15em",
                  }}
                >
                  {hydrated ? captchaNum : "• • • • •"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCaptchaNum(Math.floor(10000 + Math.random() * 90000));
                    setCaptcha("");
                  }}
                  title="تولید کد جدید"
                  className="flex items-center justify-center w-10 h-10 rounded-lg border shrink-0 transition-colors hover:text-dk-red hover:border-dk-red"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <Icon name="refresh" size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="۵ رقم را وارد کنید"
                  className="w-full h-10 px-3 rounded-lg border text-sm digits text-left focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  تاریخ انقضا
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={cardForm.exp}
                  onChange={(e) => setCardForm({ ...cardForm, exp: formatExpiry(e.target.value) })}
                  placeholder="MM/YY"
                  className="w-full h-10 px-3 rounded-lg border text-sm digits text-left focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  رمز دوم (CVV2)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  dir="ltr"
                  value={cardForm.cvv2}
                  onChange={(e) => setCardForm({ ...cardForm, cvv2: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  placeholder="••••"
                  className="w-full h-10 px-3 rounded-lg border text-sm digits text-left focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            </div>
          </div>

          {orderError && (
            <div
              className="mt-4 p-3 rounded-lg text-xs"
              style={{ background: "rgba(239,64,80,0.1)", color: "#ef4050" }}
            >
              <Icon
                name="alert"
                size={14}
                className="inline-block align-middle ml-1"
              />{" "}
              {orderError}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-5 rounded-lg border text-sm font-bold transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              بازگشت
            </button>
            <button
              type="button"
              disabled={paying || saving}
              onClick={handlePay}
              className="flex-1 h-11 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  در حال اتصال به {gateway === "shaparak" ? "شاپرک" : "سداد"}...
                </>
              ) : saving ? (
                "در حال ثبت سفارش..."
              ) : (
                <>
                  <Icon name="lock" size={16} /> پرداخت {formatPrice(total)}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: success */}
      {step === 3 && paid && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white" style={{ background: "var(--dk-green, #26a65b)" }}>
            <Icon name="check" size={30} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-extrabold mb-2">پرداخت موفق بود</h2>
          <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            سفارش شما ثبت شد و در انتظار تایید فروشگاه است.
            <br />
            در حال انتقال به صفحه پیگیری سفارش...
          </p>
        </div>
      )}
    </div>
  );
}
