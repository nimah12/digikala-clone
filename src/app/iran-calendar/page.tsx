import Link from "next/link";
import IranCalendar from "@/components/IranCalendar";
import Icon from "@/components/Icon";

export const metadata = {
  title: "ساعت و تقویم ایران | فروشگاه",
  description: "ساعت دقیق به وقت ایران، تاریخ شمسی و میلادی و تقویم ماهانه شمسی",
};

export default function IranCalendarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* هدر */}
      <div className="text-center mb-7">
        <h1 className="text-2xl md:text-3xl font-black flex items-center justify-center gap-2">
          <Icon name="calendar" size={26} className="text-dk-red" />
          ساعت و تقویم ایران
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          زمان دقیق به وقت تهران، تاریخ امروز و تقویم ماهانه شمسی
        </p>
      </div>

      <IranCalendar />

      {/* لینک‌ها */}
      <div className="flex items-center justify-center gap-3 mt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full border transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
