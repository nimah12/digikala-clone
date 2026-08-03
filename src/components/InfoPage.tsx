import type { ReactNode } from "react";

export default function InfoPage({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-4 mb-6">
          {icon && <span className="text-4xl">{icon}</span>}
          <div>
            <h1 className="text-xl font-extrabold">{title}</h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="text-sm leading-8" style={{ color: "var(--text-secondary)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
