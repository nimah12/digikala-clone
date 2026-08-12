import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-4 text-dk-red"><Icon name="search" size={60} /></div>
      <h1 className="text-xl font-extrabold mb-2">صفحه مورد نظر پیدا نشد</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        ممکن است آدرس اشتباه باشد یا صفحه حذف شده باشد.
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
