import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "رویه‌های بازگرداندن کالا" };

export default function ReturnsPage() {
  return (
    <InfoPage title="رویه‌های بازگرداندن کالا" subtitle="۷ روز ضمانت بازگشت بدون قید و شرط" icon="return">
      <p>
        اگر از خرید خود راضی نبودید، تا ۷ روز پس از تحویل کالا می‌توانید آن را بازگردانید.
      </p>
      <h2 className="font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>شرایط بازگرداندن کالا</h2>
      <ul className="mt-2 space-y-1 list-disc pr-5">
        <li>کالا بدون استفاده باشد و بسته‌بندی اصلی آن سالم باشد.</li>
        <li>برچسب و ضمانت‌نامه کالا دست‌نخورده باشد.</li>
        <li>درخواست بازگشت حداکثر ۷ روز پس از تحویل ثبت شود.</li>
      </ul>
      <h2 className="font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>مراحل بازگرداندن</h2>
      <ol className="mt-2 space-y-1 list-decimal pr-5">
        <li>با پشتیبانی آنلاین یا تلفن تماس بگیرید.</li>
        <li>شماره سفارش و دلیل بازگشت را اعلام کنید.</li>
        <li>پیک ما کالا را از آدرس شما تحویل می‌گیرد.</li>
        <li>پس از بررسی، مبلغ به روش پرداخت شما بازگردانده می‌شود.</li>
      </ol>
    </InfoPage>
  );
}
