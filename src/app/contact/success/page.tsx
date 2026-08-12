import Icon from "@/components/Icon";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پیام شما ارسال شد" };

export default function ContactSuccessPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-4 text-dk-green"><Icon name="check" size={52} /></div>
      <h1 className="text-xl font-extrabold mb-2">پیام شما با موفقیت ارسال شد</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-dk-red text-white text-sm font-bold hover:bg-dk-red-dark transition-colors"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  );
}
