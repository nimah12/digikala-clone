"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
  content: string;
  productSlugs: string[];
  published: boolean;
};

const EMPTY: Article = {
  id: "",
  title: "",
  excerpt: "",
  category: "",
  date: "",
  image: "",
  readTime: "",
  content: "",
  productSlugs: [],
  published: true,
};

export default function AdminArticlesPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  function authHeaders(): HeadersInit {
    return { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` };
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/articles", { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setArticles(data.articles || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت مقالات");
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    load();
  }, [load]);

  async function save(form: Article) {
    setSaving(true);
    setError("");
    try {
      const isNew = !articles.some((a) => a.id === form.id) || !form.id;
      const res = await fetch("/api/admin/articles", {
        method: isNew ? "POST" : "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productSlugs: form.productSlugs.map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره مقاله");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("این مقاله حذف شود؟")) return;
    try {
      const res = await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("خطا در حذف");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    }
  }

  if (status === "loading") {
    return <p className="text-sm py-16 text-center">در حال بارگذاری...</p>;
  }

  if (status === "denied") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          برای ورود به پنل مدیریت باید با حساب ادمین وارد شوید.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red rounded-xl px-5 py-2.5 transition-colors">
          ورود به حساب
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-extrabold">مقالات و اخبار</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            مدیریت مقالات و چهار اسلاید صفحه «مقالات و اخبار دنیای تکنولوژی»
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-4 py-2.5 transition-colors"
        >
          + مقاله جدید
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      {editing ? (
        <ArticleForm
          article={editing}
          saving={saving}
          isNew={!articles.some((a) => a.id === editing.id && editing.id)}
          onCancel={() => setEditing(null)}
          onSave={save}
          inputStyle={inputStyle}
        />
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center text-sm" style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          مقاله‌ای ثبت نشده است. با دکمه «مقاله جدید» اولین مقاله را بسازید.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <th className="text-right px-4 py-2 font-bold">عنوان</th>
                  <th className="text-right px-4 py-2 font-bold">دسته</th>
                  <th className="text-right px-4 py-2 font-bold">تاریخ</th>
                  <th className="text-right px-4 py-2 font-bold">وضعیت</th>
                  <th className="text-left px-4 py-2 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold">{a.title}</div>
                      <div className="text-[11px] digits" dir="ltr" style={{ color: "var(--text-muted)" }}>
                        {a.id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{a.category}</td>
                    <td className="px-4 py-3 text-xs">{a.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${a.published ? "text-white" : ""}`} style={{ background: a.published ? "#16a34a" : "var(--text-muted)" }}>
                        {a.published ? "منتشر شده" : "پیش‌نویس"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      <Link href={`/articles/${a.id}`} className="text-[11px] font-bold ml-3 hover:text-dk-red" style={{ color: "var(--text-secondary)" }}>
                        مشاهده
                      </Link>
                      <button type="button" onClick={() => setEditing({ ...a })} className="text-[11px] font-bold ml-3 text-dk-red">
                        ویرایش
                      </button>
                      <button type="button" onClick={() => remove(a.id)} className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleForm({
  article,
  saving,
  isNew,
  onCancel,
  onSave,
  inputStyle,
}: {
  article: Article;
  saving: boolean;
  isNew: boolean;
  onCancel: () => void;
  onSave: (a: Article) => void;
  inputStyle: React.CSSProperties;
}) {
  const [form, setForm] = useState<Article>(article);
  const [slugsText, setSlugsText] = useState(article.productSlugs.join("، "));

  function set<K extends keyof Article>(key: K, value: Article[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="rounded-2xl border p-5 mb-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      <h2 className="font-extrabold mb-4">{isNew ? "مقاله جدید" : `ویرایش: ${form.title}`}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">شناسه (slug)</label>
          <input dir="ltr" value={form.id} disabled={!isNew} onChange={(e) => set("id", e.target.value)} placeholder="my-article" style={{ ...inputStyle, opacity: isNew ? 1 : 0.6 }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">عنوان</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="عنوان مقاله" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">خلاصه (excerpt)</label>
          <input value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="یک خط خلاصه" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">دسته</label>
            <input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="بررسی موبایل" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">تاریخ</label>
            <input value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="۱۴۰۳/۰۵/۱۲" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">آدرس تصویر</label>
          <input dir="ltr" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/images/articles/..." style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">زمان مطالعه</label>
          <input value={form.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="۵ دقیقه" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">محصولات مرتبط (slug با ویرگول)</label>
          <input dir="ltr" value={slugsText} onChange={(e) => { setSlugsText(e.target.value); set("productSlugs", e.target.value.split(/[،,]/).map((s) => s.trim())); }} placeholder="iphone-15, galaxy-s24" style={inputStyle} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
            className="w-4 h-4 accent-[#ef4050]"
          />
          <label htmlFor="published" className="text-xs font-bold">منتشر شده (در سایت نمایش داده شود)</label>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs font-bold mb-1">متن مقاله (هر پاراگراف با یک خط خالی جدا می‌شود)</label>
        <textarea rows={8} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder={"پاراگراف اول...\n\nپاراگراف دوم..."} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="text-sm font-bold px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          انصراف
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave({ ...form, productSlugs: slugsText.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })}
          className="text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? "در حال ذخیره..." : "ذخیره مقاله"}
        </button>
      </div>
    </div>
  );
}
