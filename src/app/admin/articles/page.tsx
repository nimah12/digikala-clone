"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SafeImg } from "@/components/SafeImage";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
  content: string;
  contentBlocks?: ContentBlock[] | null;
  productSlugs: string[];
  published: boolean;
};

// بلاک چیدمان مقاله — پاراگراف، تصویر یا ویدئو بین متن
type ContentBlock =
  | { type: "p"; text: string }
  | { type: "img"; src: string }
  | { type: "video"; src: string };

// نسخه داخلی ویرایشگر — با شناسه پایدار برای مدیریت درست contentEditable و جابه‌جایی
type EditorBlock = ContentBlock & { uid: string };

function withUid(b: ContentBlock): EditorBlock {
  return { ...b, uid: crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}-${Math.random().toString(36).slice(2)}` };
}

function stripUid(b: EditorBlock): ContentBlock {
  const { uid: _uid, ...rest } = b;
  return rest as ContentBlock;
}

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

type PickedProduct = {
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
};

// تبدیل متن ساده (پاراگراف‌های جدا با خط خالی) به بلاک‌ها
function plainToBlocks(content: string): ContentBlock[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: "p" as const, text: p }));
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    (article.contentBlocks && article.contentBlocks.length > 0
      ? article.contentBlocks
      : plainToBlocks(article.content || "")
    ).map(withUid),
  );
  const [uploadingBlockImage, setUploadingBlockImage] = useState(false);
  const [uploadingBlockVideo, setUploadingBlockVideo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blockFileRef = useRef<HTMLInputElement>(null);
  const blockVideoRef = useRef<HTMLInputElement>(null);
  // هدف تعویض رسانه: وقتی نوار ابزار یک تصویر/ویدئو را «جایگزین» می‌کند، این uid مشخص می‌کند کدام بلاک
  const mediaTargetRef = useRef<string | null>(null);
  // منوی «درج بعد از این بلاک» — ایندکس بلاک مبدأ
  const [insertAfter, setInsertAfter] = useState<number | null>(null);

  // محصولات انتخاب‌شده (با اطلاعات نمایشی — تصویر محصول جدای از تصویر مقاله است)
  const [picked, setPicked] = useState<PickedProduct[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<PickedProduct[]>([]);
  const [searching, setSearching] = useState(false);

  function set<K extends keyof Article>(key: K, value: Article[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // بارگذاری اولیه: اطلاعات محصولات از قبل انتخاب‌شده (برای نمایش تصویر و نام)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slugs = article.productSlugs;
      if (!slugs.length) return;
      const out: PickedProduct[] = [];
      for (const s of slugs) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(s)}`);
          const json = await res.json();
          const hit = (json.data || []).find((p: { slug: string }) => p.slug === s);
          if (hit) out.push({ slug: hit.slug, name: hit.name, imageUrl: hit.imageUrl, price: hit.price });
        } catch {
          // نادیده بگیر
        }
      }
      if (!cancelled) setPicked(out);
    })();
    return () => {
      cancelled = true;
    };
    // فقط اولین بار (بر اساس article اولیه)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // جستجوی محصول با debounce
  useEffect(() => {
    if (searchQ.trim().length < 2) {
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ.trim())}`);
        const json = await res.json();
        setSearchResults(
          (json.data || []).map((p: { slug: string; name: string; imageUrl: string | null; price: number }) => ({
            slug: p.slug,
            name: p.name,
            imageUrl: p.imageUrl,
            price: p.price,
          })),
        );
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  function togglePick(p: PickedProduct) {
    setPicked((prev) => {
      const exists = prev.some((x) => x.slug === p.slug);
      const next = exists ? prev.filter((x) => x.slug !== p.slug) : [...prev, p];
      set("productSlugs", next.map((x) => x.slug));
      return next;
    });
  }

  function setBlock(uid: string, block: ContentBlock) {
    setBlocks((prev) => prev.map((b) => (b.uid === uid ? { ...block, uid } : b)));
  }

  function moveBlock(uid: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.uid === uid);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function removeBlock(uid: string) {
    setBlocks((prev) => prev.filter((b) => b.uid !== uid));
  }

  // درج بلاک جدید — بعد از بلاک مبدأ، یا انتهای لیست اگر null باشد
  function insertBlock(uid: string | null, block: ContentBlock) {
    setBlocks((prev) => {
      if (!uid) return [...prev, withUid(block)];
      const idx = prev.findIndex((b) => b.uid === uid);
      if (idx < 0) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, withUid(block));
      return next;
    });
    setInsertAfter(null);
  }

  // آپلود تصویر — اگر mediaTarget تعیین شده باشد جایگزین همان بلاک می‌شود، وگرنه به انتها اضافه می‌شود
  async function uploadBlockImage(file: File) {
    setUploadingBlockImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "articles");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error("آپلود ناموفق بود");
      const { url } = await res.json();
      const target = mediaTargetRef.current;
      mediaTargetRef.current = null;
      if (target !== null) {
        setBlocks((prev) => prev.map((b) => (b.uid === target ? { ...b, type: "img", src: url } : b)));
      } else {
        setBlocks((prev) => [...prev, withUid({ type: "img", src: url })]);
      }
    } catch {
      alert("آپلود تصویر ناموفق بود — دوباره تلاش کنید.");
    } finally {
      setUploadingBlockImage(false);
    }
  }

  async function uploadBlockVideo(file: File) {
    setUploadingBlockVideo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "videos");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error("آپلود ناموفق بود");
      const { url } = await res.json();
      const target = mediaTargetRef.current;
      mediaTargetRef.current = null;
      if (target !== null) {
        setBlocks((prev) => prev.map((b) => (b.uid === target ? { ...b, type: "video", src: url } : b)));
      } else {
        setBlocks((prev) => [...prev, withUid({ type: "video", src: url })]);
      }
    } catch {
      alert("آپلود ویدئو ناموفق بود — حجم فایل را بررسی کنید (حداکثر ۲۰۰MB).");
    } finally {
      setUploadingBlockVideo(false);
    }
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "articles");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dk-token") ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error("آپلود ناموفق بود");
      const { url } = await res.json();
      set("image", url);
    } catch {
      alert("آپلود عکس ناموفق بود — دوباره تلاش کنید.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="rounded-2xl border p-5 mb-4" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      <h2 className="font-extrabold mb-4">{isNew ? "مقاله جدید" : `ویرایش: ${form.title}`}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">شناسه (slug)</label>
          <input id="article-id" name="article-id" dir="ltr" value={form.id} disabled={!isNew} onChange={(e) => set("id", e.target.value)} placeholder="my-article" style={{ ...inputStyle, opacity: isNew ? 1 : 0.6 }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">عنوان</label>
          <input id="article-title" name="article-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="عنوان مقاله" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">خلاصه (excerpt)</label>
          <input id="article-excerpt" name="article-excerpt" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="یک خط خلاصه" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">دسته</label>
            <input id="article-category" name="article-category" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="بررسی موبایل" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">تاریخ</label>
            <input id="article-date" name="article-date" value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="۱۴۰۳/۰۵/۱۲" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">زمان مطالعه</label>
          <input id="article-readTime" name="article-readTime" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="۵ دقیقه" style={inputStyle} />
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

      {/* ---- تصویر مقاله (جدای از تصویر محصولات) ---- */}
      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <label className="block text-xs font-bold mb-2">تصویر مقاله (بنر بالای مقاله)</label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-40 h-24 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
            {form.image ? (
              <SafeImg src={form.image} alt="پیش‌نمایش مقاله" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px]" style={{ color: "var(--text-muted)" }}>
                بدون تصویر
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              id="article-image-file"
              name="article-image-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-lg px-3.5 py-2 transition-colors disabled:opacity-60"
            >
              {uploadingImage ? "در حال آپلود..." : "آپلود تصویر مقاله"}
            </button>
            <p className="text-[10px] leading-4" style={{ color: "var(--text-muted)" }}>
              عکس مقاله به‌صورت جدا ذخیره می‌شود و ربطی به تصویر محصولات مرتبط ندارد.
            </p>
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs font-bold mb-1">یا آدرس تصویر (اختیاری)</label>
          <input id="article-image-url" name="article-image-url" dir="ltr" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/images/articles/... یا لینک" style={inputStyle} />
        </div>
      </div>

      {/* ---- محصولات مرتبط (پیکر با جستجو) ---- */}
      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <label className="block text-xs font-bold mb-2">محصولات مرتبط با مقاله</label>
        <p className="text-[10px] mb-3 leading-4" style={{ color: "var(--text-muted)" }}>
          محصولات را جستجو و انتخاب کنید — هر محصول با تصویر خودش در انتهای مقاله نمایش داده می‌شود.
        </p>

        {/* جستجو */}
        <div className="relative">
          <input
            id="article-search"
            name="article-search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="جستجوی محصول... (مثلاً آیفون)"
            style={inputStyle}
          />
          {searching && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: "var(--text-muted)" }}>
              در حال جستجو...
            </span>
          )}
          {searchQ.trim().length >= 2 && searchResults.length > 0 && (
            <div
              className="absolute z-20 left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden max-h-56 overflow-y-auto"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              {searchResults.map((p) => {
                const added = picked.some((x) => x.slug === p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => togglePick(p)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-dk-red/5 transition-colors text-right"
                  >
                    <SafeImg src={p.imageUrl || "/images/placeholder.svg"} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] digits" style={{ color: "var(--text-muted)" }}>
                        {p.price.toLocaleString("fa-IR")} تومان
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${added ? "text-white" : ""}`}
                      style={added ? { background: "#16a34a" } : { background: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      {added ? "انتخاب شد ✓" : "+ افزودن"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* محصولات انتخاب‌شده */}
        {picked.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {picked.map((p) => (
              <div
                key={p.slug}
                className="flex items-center gap-2 pl-2 rounded-lg border"
                style={{ background: "var(--panel)", borderColor: "var(--border)" }}
              >
                <SafeImg src={p.imageUrl || "/images/placeholder.svg"} alt={p.name} className="w-8 h-8 rounded-l-lg object-cover" />
                <span className="text-[11px] font-bold max-w-[140px] truncate">{p.name}</span>
                <button
                  type="button"
                  onClick={() => togglePick(p)}
                  className="text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-dk-red hover:text-white"
                  style={{ color: "var(--text-muted)", background: "var(--bg)" }}
                  aria-label={`حذف ${p.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- چیدمان مقاله: ویرایشگر WYSIWYG — همان‌طور که در سایت نمایش داده می‌شود ---- */}
      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <label className="block text-xs font-bold">چیدمان مقاله (WYSIWYG)</label>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              دقیقاً همان چیزی که در سایت نمایش داده می‌شود — روی متن کلیک کنید تا ویرایش شود. با هاور روی هر بلاک ابزارها ظاهر می‌شوند.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => insertBlock(null, { type: "p", text: "" })}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors hover:border-dk-red hover:text-dk-red"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              + پاراگراف
            </button>
            <input
              id="article-block-image"
              name="article-block-image"
              ref={blockFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadBlockImage(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploadingBlockImage}
              onClick={() => blockFileRef.current?.click()}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors hover:border-dk-red hover:text-dk-red"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {uploadingBlockImage ? "در حال آپلود..." : "+ تصویر"}
            </button>
            <input
              id="article-block-video"
              name="article-block-video"
              ref={blockVideoRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadBlockVideo(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploadingBlockVideo}
              onClick={() => blockVideoRef.current?.click()}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white bg-dk-red hover:bg-dk-red-dark transition-colors disabled:opacity-60"
            >
              {uploadingBlockVideo ? "در حال آپلود..." : "+ ویدئو"}
            </button>
          </div>
        </div>

        {/* سند — همان چیدمان صفحه نمایش مقاله */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}
        >
          <div
            className="px-5 py-6 md:px-8 md:py-8 space-y-4 text-sm leading-8"
            style={{ color: "var(--text-secondary)" }}
          >
            {blocks.length === 0 && (
              <p className="text-[11px] text-center py-4" style={{ color: "var(--text-muted)" }}>
                هنوز بلاکی اضافه نشده — با دکمه‌های بالا شروع کنید.
              </p>
            )}
            {blocks.map((b) => (
              <BlockEditor
                key={b.uid}
                block={b}
                index={blocks.findIndex((x) => x.uid === b.uid)}
                total={blocks.length}
                insertAfter={insertAfter === blocks.findIndex((x) => x.uid === b.uid)}
                onInsertAfter={() => setInsertAfter(blocks.findIndex((x) => x.uid === b.uid))}
                onCloseInsert={() => setInsertAfter(null)}
                onChange={(block) => setBlock(b.uid, block)}
                onMove={(dir) => moveBlock(b.uid, dir)}
                onRemove={() => removeBlock(b.uid)}
                onInsert={(block) => insertBlock(b.uid, block)}
                onUploadImage={() => {
                  mediaTargetRef.current = b.uid;
                  blockFileRef.current?.click();
                }}
                onUploadVideo={() => {
                  mediaTargetRef.current = b.uid;
                  blockVideoRef.current?.click();
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="text-sm font-bold px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          انصراف
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            onSave({
              ...form,
              content: blocks
                .filter((b) => b.type === "p" && b.text.trim())
                .map((b) => (b as { type: "p"; text: string }).text)
                .join("\n\n"),
              productSlugs: picked.map((x) => x.slug),
              contentBlocks: blocks
                .filter((b) => (b.type === "p" ? b.text.trim() : b.src.trim()))
                .map(stripUid),
            })
          }
          className="text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? "در حال ذخیره..." : "ذخیره مقاله"}
        </button>
      </div>
    </div>
  );
}

// یک بلاک در ویرایشگر WYSIWYG — پاراگراف قابل‌ویرایش مستقیم، یا تصویر/ویدئو با همان ظاهر سایت
function BlockEditor({
  block,
  index,
  total,
  insertAfter,
  onInsertAfter,
  onCloseInsert,
  onChange,
  onMove,
  onRemove,
  onInsert,
  onUploadImage,
  onUploadVideo,
}: {
  block: EditorBlock;
  index: number;
  total: number;
  insertAfter: boolean;
  onInsertAfter: () => void;
  onCloseInsert: () => void;
  onChange: (b: ContentBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onInsert: (b: ContentBlock) => void;
  onUploadImage: () => void;
  onUploadVideo: () => void;
}) {
  return (
    <div className="wysiwyg-block">
      {/* نوار ابزار هاور */}
      <div className="wysiwyg-toolbar">
        <span className="px-1.5 text-[9px] font-bold text-white/80">
          {block.type === "p" ? "متن" : block.type === "img" ? "تصویر" : "ویدئو"} {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="w-6 h-6 rounded-md text-[11px] text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
          title="انتقال به بالا"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="w-6 h-6 rounded-md text-[11px] text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
          title="انتقال به پایین"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="w-6 h-6 rounded-md text-[11px] text-white hover:bg-dk-red transition-colors"
          title="حذف بلاک"
        >
          ✕
        </button>
      </div>

      {block.type === "p" ? (
        <p
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          data-placeholder="متن پاراگراف را بنویسید..."
          className="wysiwyg-para whitespace-pre-line"
          onInput={(e) => onChange({ type: "p", text: e.currentTarget.textContent ?? "" })}
          onBlur={(e) => onChange({ type: "p", text: (e.currentTarget.textContent ?? "").trim() })}
          ref={(el) => {
            // همگام‌سازی اولیه و هنگام تغییر از بیرون (بدون جابه‌جایی مکان‌نما هنگام تایپ)
            if (el && el.textContent !== block.text) el.textContent = block.text;
          }}
        />
      ) : block.type === "video" ? (
        <figure className="wysiwyg-media aspect-video">
          {block.src ? (
            <video src={block.src} controls preload="metadata" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span className="text-2xl">🎬</span>
              <span className="text-[11px]">ویدئو — روی «جایگزینی» کلیک کنید</span>
            </div>
          )}
          {block.src && (
            <button
              type="button"
              onClick={onUploadVideo}
              className="absolute bottom-2 left-2 z-10 text-[10px] font-bold text-white bg-black/60 hover:bg-dk-red rounded-lg px-2.5 py-1 transition-colors"
            >
              جایگزینی ویدئو
            </button>
          )}
        </figure>
      ) : (
        <figure className="wysiwyg-media aspect-[16/9]">
          {block.src ? (
            <SafeImg src={block.src} alt="تصویر داخل مقاله" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span className="text-2xl">🖼️</span>
              <span className="text-[11px]">تصویر — روی «جایگزینی» کلیک کنید</span>
            </div>
          )}
          {block.src && (
            <button
              type="button"
              onClick={onUploadImage}
              className="absolute bottom-2 left-2 z-10 text-[10px] font-bold text-white bg-black/60 hover:bg-dk-red rounded-lg px-2.5 py-1 transition-colors"
            >
              جایگزینی تصویر
            </button>
          )}
        </figure>
      )}

      {/* خط «درج بعد از این بلاک» */}
      <div className="wysiwyg-addline">
        {insertAfter ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onInsert({ type: "p", text: "" })}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-dk-red text-white hover:bg-dk-red-dark transition-colors"
            >
              + متن
            </button>
            <button
              type="button"
              onClick={onUploadImage}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors hover:border-dk-red hover:text-dk-red"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              + تصویر
            </button>
            <button
              type="button"
              onClick={onUploadVideo}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors hover:border-dk-red hover:text-dk-red"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              + ویدئو
            </button>
            <button
              type="button"
              onClick={onCloseInsert}
              className="text-[10px] px-2 py-1 rounded-full text-[var(--text-muted)] hover:bg-dk-red/10 hover:text-dk-red transition-colors"
            >
              بستن
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onInsertAfter}
            className="w-7 h-7 rounded-full border text-sm font-bold transition-all hover:scale-110 hover:border-dk-red hover:text-dk-red"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--panel)" }}
            title="درج بلاک جدید بعد از این"
            aria-label="درج بلاک جدید"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
