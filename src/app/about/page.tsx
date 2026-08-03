import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "درباره دیجی‌کلون" };

export default function AboutPage() {
  return (
    <InfoPage
      title="درباره دیجی‌کلون"
      subtitle="فروشگاه اینترنتی نمونه، ساخته‌شده با عشق به فناوری"
      icon="🚀"
    >
      <p>
        دیجی‌کلون یک فروشگاه اینترنتی نمونه است که به‌عنوان پروژه نمونه‌کار در مسیر یادگیری
        فول‌استک ساخته شده است. هدف ما نشان دادن یک تجربه خرید آنلاین واقعی و روان است —
        از جستجوی محصول تا سبد خرید، انتخاب روش ارسال و پرداخت.
      </p>
      <p className="mt-4">
        این پروژه با تکنولوژی‌های زیر توسعه داده شده:
      </p>
      <ul className="mt-2 space-y-1 list-disc pr-5">
        <li>Next.js 16 با App Router و Server Components</li>
        <li>TypeScript برای تایپ امن</li>
        <li>Tailwind CSS برای طراحی واکنش‌گرا و زیبا</li>
        <li>Prisma + PostgreSQL برای داده‌های واقعی</li>
      </ul>
      <p className="mt-4">
        همه‌ی محصولات، نظرات کاربران و دسته‌بندی‌ها از یک دیتابیس واقعی خوانده می‌شوند و
        تمام دکمه‌ها و لینک‌ها واقعاً کار می‌کنند.
      </p>
    </InfoPage>
  );
}
