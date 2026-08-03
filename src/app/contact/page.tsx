import type { Metadata } from "next";
import { CONTACT_INFO } from "@/lib/site";

export const metadata: Metadata = { title: "تماس با ما" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <h1 className="text-xl font-extrabold mb-6">تماس با ما</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg)" }}>
            <div className="text-3xl mb-2">📞</div>
            <div className="text-xs font-bold">تلفن تماس</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }} dir="ltr">
              {CONTACT_INFO.phone}
            </div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg)" }}>
            <div className="text-3xl mb-2">✉️</div>
            <div className="text-xs font-bold">ایمیل</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }} dir="ltr">
              {CONTACT_INFO.email}
            </div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg)" }}>
            <div className="text-3xl mb-2">🕘</div>
            <div className="text-xs font-bold">ساعات پاسخگویی</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {CONTACT_INFO.hours}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-8" style={{ background: "var(--bg)" }}>
          <div className="text-xs font-bold mb-1">📍 آدرس</div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {CONTACT_INFO.address}
          </div>
        </div>

        <form
          action="/contact/success"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">نام شما</label>
              <input
                type="text"
                name="name"
                required
                placeholder="مثلاً: علی محمدی"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">ایمیل شما</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">موضوع</label>
            <select
              name="subject"
              className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <option>پیگیری سفارش</option>
              <option>بازگرداندن کالا</option>
              <option>پیشنهاد و انتقاد</option>
              <option>سایر</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">متن پیام</label>
            <textarea
              name="message"
              rows={5}
              required
              placeholder="پیام خود را بنویسید..."
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/50"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <button
            type="submit"
            className="h-11 px-8 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
          >
            ارسال پیام
          </button>
        </form>
      </div>
    </div>
  );
}
