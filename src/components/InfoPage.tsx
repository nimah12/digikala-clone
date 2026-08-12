import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export default function InfoPage({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 md:p-8" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-4 mb-6">
          {icon && <span className="text-dk-red"><Icon name={icon} size={28} strokeWidth={1.6} /></span>}
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
