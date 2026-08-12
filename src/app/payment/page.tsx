import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "شیوه‌های پرداخت" };

export default function PaymentPage() {
  return (
    <InfoPage title="شیوه‌های پرداخت" subtitle="پرداخت آنلاین به‌زودی فعال می‌شود" icon="credit-card">
      <div className="rounded-xl border p-4 mb-6" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <div className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--text)" }}><Icon name="alert" size={16} className="text-dk-red" /> وضعیت فعلی درگاه پرداخت</div>
        <p className="text-xs leading-6">
          در حال حاضر زیرساخت‌های پرداخت فعال نمی‌باشد. تیم فنی دیجی‌کلون در تلاش است تا در
          اسرع وقت به موضوع رسیدگی کند. به محض فعال شدن درگاه، امکان پرداخت آنلاین برای
          تمام سفارش‌ها فراهم خواهد شد.
        </p>
      </div>
      <h2 className="font-bold mb-2" style={{ color: "var(--text)" }}>پس از فعال شدن درگاه</h2>
      <ul className="mt-2 space-y-1 list-disc pr-5">
        <li>پرداخت با تمام کارت‌های عضو شتاب</li>
        <li>پرداخت امن با پروتکل SSL</li>
        <li>صدور فاکتور الکترونیکی پس از پرداخت</li>
        <li>امکان پرداخت در محل برای پیک گنجه</li>
      </ul>
    </InfoPage>
  );
}
