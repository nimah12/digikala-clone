import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = { title: "مقالات و اخبار" };
export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-lg font-extrabold mb-6">مقالات و اخبار دنیای تکنولوژی</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="group block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            <div className="relative aspect-[16/9] overflow-hidden" style={{ background: "var(--bg)" }}>
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "var(--panel)", color: "#ef4050" }}>
                {article.category}
              </span>
            </div>
            <div className="p-3 space-y-2">
              <h2 className="text-sm font-bold leading-6 line-clamp-2 min-h-[48px]">{article.title}</h2>
              <p className="text-xs leading-5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
