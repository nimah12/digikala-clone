"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import IconPicker from "@/components/IconPicker";

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  groupId: number | null;
  parentId: number | null;
  productCount: number;
  children: CategoryNode[];
};

type MenuGroup = {
  id: number;
  title: string;
  icon: string | null;
  order: number;
};


// تبدیل ساده اسم فارسی به slug (فقط برای پیشنهاد خودکار؛ قابل ویرایش)
function toSlug(input: string): string {
  const map: Record<string, string> = {
    ا: "a", آ: "a", ب: "b", پ: "p", ت: "t", ث: "s", ج: "j", چ: "ch", ح: "h",
    خ: "kh", د: "d", ذ: "z", ر: "r", ز: "z", ژ: "zh", س: "s", ش: "sh",
    ص: "s", ض: "z", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "gh",
    ک: "k", گ: "g", ل: "l", م: "m", ن: "n", و: "v", ه: "h", ی: "y", ئ: "y",
    " ": "-",
  };
  const digits: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  let out = "";
  for (const ch of input.trim().toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) out += ch;
    else if (digits[ch]) out += digits[ch];
    else if (map[ch] !== undefined) out += map[ch];
    else out += "-";
  }
  return out
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // فرم افزودن دسته/ساب‌دسته: parentId=null یعنی دسته‌ی اصلی (ریشه)
  const [adding, setAdding] = useState<null | {
    parentId: number | null;
    groupId: number | null;
  }>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newIcon, setNewIcon] = useState("tag");
  const [newOrder, setNewOrder] = useState("0");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // ویرایش دسته
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIcon, setEditIcon] = useState("tag");
  const [editOrder, setEditOrder] = useState("0");
  const [editGroupId, setEditGroupId] = useState<string>("");
  const [editParentId, setEditParentId] = useState<string>("");
  const [editSaving, setEditSaving] = useState(false);

  // افزودن محصول
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodSlugTouched, setProdSlugTouched] = useState(false);
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("0");
  const [prodDiscount, setProdDiscount] = useState("0");
  const [prodImage, setProdImage] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodSizes, setProdSizes] = useState<{ name: string; stock: string }[]>([]);
  // افزودن بازه‌ای سایزهای عددی (کفش و ...)
  const [prodSizeFrom, setProdSizeFrom] = useState("36");
  const [prodSizeTo, setProdSizeTo] = useState("45");
  const [prodSizeStep, setProdSizeStep] = useState("1");
  const [prodSizeStock, setProdSizeStock] = useState("3");
  const [prodSizeRangeError, setProdSizeRangeError] = useState("");
  const [prodSaving, setProdSaving] = useState(false);
  const [prodError, setProdError] = useState("");

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  async function loadAll() {
    try {
      const res = await fetch("/api/admin/categories", { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setTree(data.tree || []);
      setGroups(data.groups || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت دسته‌بندی‌ها");
      setStatus("ready");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("dk-token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      return;
    }
    fetch("/api/admin/me", { headers: authHeaders() }).then(async (res) => {
      if (!res.ok) {
        setStatus("denied");
        return;
      }
      await loadAll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAdd(parentId: number | null, groupId: number | null) {
    setAdding({ parentId, groupId });
    setNewName("");
    setNewSlug("");
    setNewIcon("tag");
    setNewOrder("0");
    setSlugTouched(false);
    setError("");
  }

  async function handleAddCategory() {
    setError("");
    if (!newName.trim()) {
      setError("اسم دسته‌بندی رو وارد کن");
      return;
    }
    const slug = slugTouched ? newSlug.trim() : toSlug(newName);
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      setError("slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشه");
      return;
    }
    if (!adding) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug,
          icon: newIcon,
          order: Number(newOrder) || 0,
          parentId: adding.parentId,
          groupId: adding.parentId === null ? adding.groupId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "افزودن دسته‌بندی ناموفق بود");
      setAdding(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(node: CategoryNode) {
    setEditingId(node.id);
    setEditName(node.name);
    setEditSlug(node.slug);
    setEditIcon(node.icon || "tag");
    setEditOrder(String(node.order));
    setEditGroupId(node.groupId === null ? "" : String(node.groupId));
    setEditParentId(node.parentId === null ? "" : String(node.parentId));
    setError("");
  }

  async function handleSaveEdit() {
    setError("");
    if (!editName.trim()) {
      setError("اسم دسته‌بندی رو وارد کن");
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(editSlug.trim())) {
      setError("slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشه");
      return;
    }
    setEditSaving(true);
    try {
      const parentId = editParentId === "" ? null : Number(editParentId);
      const groupId = parentId === null && editGroupId !== "" ? Number(editGroupId) : null;
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editingId,
          name: editName.trim(),
          slug: editSlug.trim(),
          icon: editIcon,
          order: Number(editOrder) || 0,
          parentId,
          groupId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ویرایش ناموفق بود");
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(categoryId: number) {
    if (!confirm("مطمئنی می‌خوای این دسته‌بندی رو حذف کنی؟")) return;
    setError("");
    setDeletingId(categoryId);
    try {
      const res = await fetch(`/api/admin/categories?categoryId=${categoryId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "حذف ناموفق بود");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setDeletingId(null);
    }
  }

  function startAddProduct(category: CategoryNode) {
    setAddingProductId(category.id);
    setProdName("");
    setProdSlug("");
    setProdSlugTouched(false);
    setProdPrice("");
    setProdStock("0");
    setProdDiscount("0");
    setProdImage("");
    setProdDescription("");
    setProdSizes([]);
    setProdSizeFrom("36");
    setProdSizeTo("45");
    setProdSizeStep("1");
    setProdSizeStock("3");
    setProdSizeRangeError("");
    setProdError("");
  }

  function updateProdSize(index: number, patch: Partial<{ name: string; stock: string }>) {
    setProdSizes((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addProdSizeRange() {
    setProdSizeRangeError("");
    const from = Number(prodSizeFrom);
    const to = Number(prodSizeTo);
    const step = Number(prodSizeStep);
    const stockVal = Number(prodSizeStock);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      setProdSizeRangeError("بازه‌ی سایز نامعتبره (از باید کوچک‌تر یا مساوی تا باشه)");
      return;
    }
    if (!Number.isFinite(step) || step <= 0) {
      setProdSizeRangeError("گام باید عددی مثبت باشه (مثلاً ۱ یا ۰٫۵)");
      return;
    }
    const rows: { name: string; stock: string }[] = [];
    for (let v = from; v <= to + 1e-9; v += step) {
      rows.push({
        name: Number(v.toFixed(2)).toString(),
        stock: Number.isFinite(stockVal) && stockVal > 0 ? String(Math.floor(stockVal)) : "0",
      });
      if (rows.length > 60) break;
    }
    if (rows.length === 0) {
      setProdSizeRangeError("هیچ سایزی در این بازه تولید نشد");
      return;
    }
    setProdSizes((prev) => [...prev, ...rows]);
    setProdSizeFrom("");
    setProdSizeTo("");
  }

  async function handleAddProduct(category: CategoryNode) {
    setProdError("");
    const price = Number(prodPrice);
    const stock = Number(prodStock);
    const discountPercent = Number(prodDiscount);
    if (!prodName.trim()) {
      setProdError("اسم محصول رو وارد کن");
      return;
    }
    const slug = prodSlugTouched ? prodSlug.trim() : toSlug(prodName);
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      setProdError("slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشه");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setProdError("قیمت نامعتبره");
      return;
    }
    setProdSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName.trim(),
          slug,
          categorySlug: category.slug,
          price,
          stock: Number.isInteger(stock) ? stock : 0,
          discountPercent: Number.isInteger(discountPercent) ? discountPercent : 0,
          imageUrl: prodImage.trim() || undefined,
          description: prodDescription.trim() || undefined,
          sizes: prodSizes
            .filter((s) => s.name.trim())
            .map((s) => ({ name: s.name.trim(), stock: Number(s.stock) || 0 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "افزودن محصول ناموفق بود");
      setAddingProductId(null);
      await loadAll();
    } catch (err) {
      setProdError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setProdSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
    width: 160,
  };

  function renderAddForm() {
    if (!adding) return null;
    const isRoot = adding.parentId === null;
    const group = groups.find((g) => g.id === adding.groupId);
    return (
      <div className="mb-6 rounded-2xl border p-4"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        <div className="text-xs font-bold mb-3">
          افزودن {isRoot ? "دسته‌ی اصلی" : "ساب‌دسته"}
          {group && ` به گروه «${group.title}»`}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs mb-1">اسم</div>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (!slugTouched) setNewSlug(toSlug(e.target.value));
              }}
              placeholder="مثلاً موبایل"
              style={inputStyle}
            />
          </div>
          <div>
            <div className="text-xs mb-1">slug</div>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setNewSlug(e.target.value);
              }}
              placeholder="mobile"
              style={inputStyle}
            />
          </div>
          <div style={{ width: 280 }}>
            <div className="text-xs mb-1">آیکون (همه آیکون‌های Lucide)</div>
            <IconPicker value={newIcon} onChange={setNewIcon} />
          </div>
          <div>
            <div className="text-xs mb-1">ترتیب</div>
            <input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              style={{ ...inputStyle, width: 70 }}
            />
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={saving}
            className="text-sm font-bold text-white bg-dk-red rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? "در حال ثبت..." : "ثبت"}
          </button>
          <button
            type="button"
            onClick={() => setAdding(null)}
            className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            انصراف
          </button>
        </div>
      </div>
    );
  }

  function renderAddProductForm(category: CategoryNode) {
    if (addingProductId !== category.id) return null;
    return (
      <div className="my-3 rounded-xl border p-4"
        style={{ background: "var(--panel)", borderColor: "#d6e0f5" }}>
        <div className="text-xs font-bold mb-3">
          افزودن محصول به «{category.name}»
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs mb-1">اسم محصول</div>
            <input
              type="text"
              value={prodName}
              onChange={(e) => {
                setProdName(e.target.value);
                if (!prodSlugTouched) setProdSlug(toSlug(e.target.value));
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <div className="text-xs mb-1">slug</div>
            <input
              type="text"
              value={prodSlug}
              onChange={(e) => {
                setProdSlugTouched(true);
                setProdSlug(e.target.value);
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <div className="text-xs mb-1">قیمت اصلی (تومان)</div>
            <input
              type="number"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div className="text-xs mb-1">موجودی</div>
            <input
              type="number"
              value={prodStock}
              onChange={(e) => setProdStock(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
          <div>
            <div className="text-xs mb-1">تخفیف ٪</div>
            <input
              type="number"
              value={prodDiscount}
              onChange={(e) => setProdDiscount(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
          <div className="w-full text-[11px]" style={{ color: "var(--text-secondary)" }}>
            قیمت اصلی را وارد کن؛ قیمت نهایی با کسر ٪ تخفیف به‌صورت خودکار محاسبه و در سبد/تسویه اعمال می‌شود.
          </div>
          <div>
            <div className="text-xs mb-1">عکس (url)</div>
            <input
              type="text"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              placeholder="https://..."
              style={{ ...inputStyle, width: 220 }}
            />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs mb-1">توضیحات</div>
          <input
            type="text"
            value={prodDescription}
            onChange={(e) => setProdDescription(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div className="mt-3">
          <div className="text-xs mb-1">سایزها (اختیاری — متنی مثل S/M/L یا عددی مثل ۳۸/۴۰/۴۲)</div>
          <div
            className="flex flex-wrap items-center gap-2 mb-2 rounded-lg border p-2"
            style={{ borderColor: "#e0e0e0", background: "var(--bg)" }}
          >
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              افزودن بازه‌ی عددی:
            </span>
            <input
              type="number"
              step={0.5}
              value={prodSizeFrom}
              onChange={(e) => setProdSizeFrom(e.target.value)}
              style={{ ...inputStyle, width: 64 }}
              aria-label="سایز شروع"
            />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>تا</span>
            <input
              type="number"
              step={0.5}
              value={prodSizeTo}
              onChange={(e) => setProdSizeTo(e.target.value)}
              style={{ ...inputStyle, width: 64 }}
              aria-label="سایز پایان"
            />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>گام</span>
            <input
              type="number"
              step={0.5}
              min={0.5}
              value={prodSizeStep}
              onChange={(e) => setProdSizeStep(e.target.value)}
              style={{ ...inputStyle, width: 56 }}
              aria-label="گام"
            />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>موجودی هر کدوم</span>
            <input
              type="number"
              min={0}
              value={prodSizeStock}
              onChange={(e) => setProdSizeStock(e.target.value)}
              style={{ ...inputStyle, width: 56 }}
              aria-label="موجودی هر سایز"
            />
            <button
              type="button"
              onClick={addProdSizeRange}
              className="text-xs font-bold rounded-lg px-3 py-1.5 transition-colors"
              style={{ border: "1px solid #23254e", color: "#23254e", background: "var(--panel)" }}
            >
              + افزودن بازه (۳۶ تا ۴۵)
            </button>
            <button
              type="button"
              onClick={() => {
                setProdSizeFrom("36");
                setProdSizeTo("45");
                setProdSizeStep("1");
                setProdSizeStock("3");
              }}
              className="text-[11px] font-bold rounded-lg px-2 py-1 transition-colors"
              style={{ border: "none", background: "#eee", color: "#555" }}
            >
              پیش‌فرض کفش
            </button>
          </div>
          {prodSizeRangeError && (
            <p className="text-xs text-dk-red mb-1">{prodSizeRangeError}</p>
          )}
          {prodSizes.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {prodSizes.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="سایز (مثلاً XL)"
                    value={row.name}
                    onChange={(e) => updateProdSize(i, { name: e.target.value })}
                    style={{ ...inputStyle, width: 120 }}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="موجودی"
                    value={row.stock}
                    onChange={(e) => updateProdSize(i, { stock: e.target.value })}
                    style={{ ...inputStyle, width: 90 }}
                  />
                  <button
                    type="button"
                    onClick={() => setProdSizes((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs font-bold text-dk-red border border-dk-red/40 rounded-lg px-2 py-1 transition-colors hover:bg-dk-red/10"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setProdSizes((prev) => [...prev, { name: "", stock: "" }])}
            className="text-xs font-bold border rounded-lg px-3 py-1.5 transition-colors hover:bg-dk-bg"
            style={{ borderColor: "var(--border)" }}
          >
            + افزودن سایز
          </button>
        </div>
        {prodError && <p className="text-xs text-dk-red mt-2">{prodError}</p>}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleAddProduct(category)}
            disabled={prodSaving}
            className="text-sm font-bold text-white bg-dk-red rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
          >
            {prodSaving ? "در حال ثبت..." : "ثبت محصول"}
          </button>
          <button
            type="button"
            onClick={() => setAddingProductId(null)}
            className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            انصراف
          </button>
        </div>
      </div>
    );
  }

  function renderActions(node: CategoryNode) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => startAdd(node.id, null)}
          className="text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors hover:border-dk-red hover:text-dk-red"
          style={{ borderColor: "var(--border)" }}
        >
          + ساب‌دسته
        </button>
        <button
          type="button"
          onClick={() => startAddProduct(node)}
          className="text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors hover:border-dk-red hover:text-dk-red"
          style={{ borderColor: "var(--border)" }}
        >
          + محصول
        </button>
        <button
          type="button"
          onClick={() => startEdit(node)}
          className="text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors hover:border-dk-red hover:text-dk-red"
          style={{ borderColor: "var(--border)" }}
        >
          ویرایش
        </button>
        <button
          type="button"
          onClick={() => handleDelete(node.id)}
          disabled={deletingId === node.id}
          className="text-[11px] font-bold rounded-lg px-2.5 py-1 text-dk-red border border-dk-red/40 hover:bg-dk-red/10 transition-colors disabled:opacity-50"
        >
          {deletingId === node.id ? "..." : "حذف"}
        </button>
      </div>
    );
  }

  function renderNode(node: CategoryNode, depth: number) {
    return (
      <div key={node.id}>
        <div
          className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-dk-bg transition-colors"
          style={depth > 0 ? { marginRight: 20 + (depth - 1) * 18 } : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ background: depth === 0 ? "#23254e" : "#ef4050" }}
            >
              {node.icon || "tag"}
            </span>
            <div className="min-w-0">
              <Link
                href={`/category/${node.slug}`}
                className="text-sm font-bold hover:text-dk-red transition-colors truncate"
              >
                {node.name}
              </Link>
              <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <span dir="ltr">/{node.slug}</span>
                {" • "}
                {node.productCount.toLocaleString("fa-IR")} محصول
                {node.children.length > 0 && ` • ${node.children.length.toLocaleString("fa-IR")} ساب‌دسته`}
              </div>
            </div>
          </div>
          {renderActions(node)}
        </div>
        {adding?.parentId === node.id && (
          <div style={{ marginRight: 40 }}>{renderAddForm()}</div>
        )}
        {addingProductId === node.id && (
          <div style={{ marginRight: 20 }}>{renderAddProductForm(node)}</div>
        )}
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  function renderRootList(roots: CategoryNode[]) {
    if (roots.length === 0) {
      return (
        <p className="text-xs py-4 text-center" style={{ color: "var(--text-secondary)" }}>
          هنوز دسته‌ای ندارد.
        </p>
      );
    }
    return roots.map((root) => renderNode(root, 0));
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

  const ungrouped = tree.filter((r) => r.groupId === null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-extrabold">دسته‌بندی‌ها</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            ساختار مگامنو: گروه → دسته‌ی اصلی → ساب‌دسته. با «+ دسته‌ی اصلی» شروع کن.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startAdd(null, null)}
          className="text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-4 py-2 transition-colors"
        >
          + دسته‌ی اصلی
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      {adding && adding.parentId === null && renderAddForm()}

      {groups.length === 0 && ungrouped.length === 0 && (
        <div className="py-16 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          هنوز دسته‌بندی‌ای تعریف نشده. ابتدا از صفحه‌ی «گروه‌های منو» گروه بساز،
          یا با «+ دسته‌ی اصلی» بدون گروه شروع کن.
        </div>
      )}

      {groups.map((group) => {
        const roots = tree.filter((r) => r.groupId === group.id);
        return (
          <div
            key={group.id}
            className="mb-6 rounded-2xl border overflow-hidden"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-dk-red text-white">
              <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-white/20 text-xs">
                {group.icon || "tag"}
              </span>
              <h2 className="text-sm font-extrabold">{group.title}</h2>
              <span className="text-[11px] opacity-80">
                ({roots.length.toLocaleString("fa-IR")} دسته)
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => startAdd(null, group.id)}
                className="text-[11px] font-bold bg-white/20 rounded-lg px-2.5 py-1 hover:bg-white/30 transition-colors"
              >
                + دسته در این گروه
              </button>
            </div>
            <div className="p-2">{renderRootList(roots)}</div>
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div
          className="mb-6 rounded-2xl border overflow-hidden"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 text-sm font-extrabold" style={{ background: "color-mix(in srgb, var(--bg) 60%, transparent)" }}>
            بدون گروه (پیشنهاد: به یکی از گروه‌ها منتقل کن)
          </div>
          <div className="p-2">{renderRootList(ungrouped)}</div>
        </div>
      )}

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border p-5"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-extrabold mb-4">ویرایش دسته‌بندی</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold mb-1">اسم</div>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">slug</div>
                <input type="text" dir="ltr" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">آیکون (همه آیکون‌های Lucide)</div>
                <IconPicker value={editIcon} onChange={setEditIcon} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">ترتیب</div>
                <input type="number" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} style={{ ...inputStyle, width: 80 }} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">گروه منو (فقط برای دسته‌ی اصلی)</div>
                <select value={editGroupId} onChange={(e) => setEditGroupId(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">بدون گروه</option>
                  {groups.map((g) => (
                    <option key={g.id} value={String(g.id)}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-bold mb-1">والد (ساب‌دسته بودن)</div>
                <select value={editParentId} onChange={(e) => setEditParentId(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">دسته‌ی اصلی (ریشه)</option>
                  {tree.map((r) => (
                    <option key={r.id} value={String(r.id)}>— {r.name}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-xs text-dk-red">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="text-sm font-bold text-white bg-dk-red rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {editSaving ? "در حال ذخیره..." : "ذخیره"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
