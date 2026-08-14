import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer
      className="border-t mt-10"
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FOOTER_LINKS.map((col, i) => (
            <div
              key={col.title}
              className={i > 0 ? "md:border-s" : undefined}
              style={i > 0 ? { borderColor: "var(--border)" } : undefined}
            >
              <h3 className="text-sm font-bold mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs hover:text-dk-red transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:border-s" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-sm font-bold mb-3">
              فروشگاه اینترنتی دیجی‌کلون
            </h3>
            <p
              className="text-xs leading-6"
              style={{ color: "var(--text-secondary)" }}
            >
              دیجی‌کلون، اولین و بزرگ‌ترین فروشگاه اینترنتی نمونه ایرانی، با
              ده‌ها هزار کالای دیجیتال، خدمات پس از فروش و ضمانت اصالت کالا.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="mailto:nima.hasani.dev@gmail.com"
                className="inline-flex items-center gap-2 text-xs hover:text-dk-red transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                nima.hasani.dev@gmail.com
              </a>
              <a
                href="https://github.com/nimah12"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs hover:text-dk-red transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="15"
                  height="15"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.04 11.04 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
                github.com/nimah12
              </a>
            </div>
          </div>
        </div>
        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            © ۱۴۰۵ — فروشگاه دیجی‌کلون (پروژه نمونه‌کار)
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-xs hover:text-dk-red transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              نماد اعتماد الکترونیکی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
