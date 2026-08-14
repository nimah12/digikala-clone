import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group block bg-white rounded-xl border border-dk-border overflow-hidden hover:shadow-lg transition-shadow"
      style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
    >
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: "var(--bg)" }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className="absolute top-2 right-2 text-[11px] font-bold px-2 py-1 rounded-lg"
          style={{ background: "var(--panel)", color: "var(--dk-red, #ef4050)" }}
        >
          {article.category}
        </span>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-bold leading-6 line-clamp-2 min-h-[48px]">
          {article.title}
        </h3>
        <p
          className="text-xs leading-5 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {article.excerpt}
        </p>
        <div
          className="flex items-center justify-between pt-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{article.date}</span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {article.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
