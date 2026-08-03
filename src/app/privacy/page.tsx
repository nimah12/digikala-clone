import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "حریم خصوصی" };

export default function PrivacyPage() {
  return (
    <InfoPage title="حریم خصوصی" subtitle="چگونگی استفاده از اطلاعات شما در دیجی‌کلون" icon="🔒">
      <p>
        حریم خصوصی شما برای ما بسیار مهم است. این صفحه توضیح می‌دهد که چه اطلاعاتی از
        شما جمع‌آوری می‌شود و چگونه از آن استفاده می‌کنیم.
      </p>
      <h2 className="font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>۱. اطلاعات جمع‌آوری‌شده</h2>
      <p>
        برای ثبت سفارش، نام، شماره تماس و آدرس شما را دریافت می‌کنیم. این اطلاعات صرفاً
        برای پردازش و ارسال سفارش استفاده می‌شود.
      </p>
      <h2 className="font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>۲. کوکی‌ها</h2>
      <p>
        برای نگهداری سبد خرید و تنظیمات ظاهری (مانند حالت شب و روز) از کوکی مرورگر استفاده
        می‌کنیم. این اطلاعات به هیچ وجه به اشخاص ثالث فروخته نمی‌شود.
      </p>
      <h2 className="font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>۳. امنیت اطلاعات</h2>
      <p>
        تمام داده‌ها در دیتابیس امن نگهداری می‌شوند و دسترسی به آن‌ها فقط برای پرسنل مجاز
        فروشگاه ممکن است.
      </p>
    </InfoPage>
  );
}
