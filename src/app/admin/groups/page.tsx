"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MenuGroup = {
  id: number;
  title: string;
  icon: string | null;
  order: number;
  _count: { categories: number };
};

const ICON_OPTIONS = [
  "phone",
  "laptop",
  "tablet",
  "watch",
  "coins",
  "basket",
  "shirt",
  "gamepad",
  "wrench",
  "headphones",
  "home",
  "coffee",
  "book",
  "spray",
  "gift",
  "lamp",
  "camera",
  "t-shirt",
  "shoe",
  "monitor",
  "tag",
  "box",
  "heart",
  "car",
];

export default function AdminGroupsPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [error, setError] = useState("");

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("tag");
  const [newOrder, setNewOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("tag");
  const [editOrder, setEditOrder] = useState("0");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  function authHeaders(): HeadersInit {
    const token = localStorage.getItem("dk-token") || "";
    return { Authorization: `Bearer ${token}` };
  }

  async function loadGroups() {
    try {
      const res = await fetch("/api/admin/groups", { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) {
        setStatus("denied");
        return;
      }
      const data = await res.json();
      setGroups(data.groups || []);
      setStatus("ready");
    } catch {
      setError("خطا در دریافت گروه‌ها");
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
      await loadGroups();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAdd() {
    setAdding(true);
    setNewTitle("");
    setNewIcon("tag");
    setNewOrder(String(groups.length));
    setError("");
  }

  async function handleAdd() {
    setError("");
    if (!newTitle.trim()) {
      setError("عنوان گروه را وارد کن");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          icon: newIcon,
          order: Number(newOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "افزودن ناموفق بود");
      setAdding(false);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(g: MenuGroup) {
    setEditingId(g.id);
    setEditTitle(g.title);
    setEditIcon(g.icon || "tag");
    setEditOrder(String(g.order));
    setError("");
  }

  async function handleSaveEdit() {
    setError("");
    if (!editTitle.trim()) {
      setError("عنوان گروه را وارد کن");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: editingId,
          title: editTitle.trim(),
          icon: editIcon,
          order: Number(editOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ویرایش ناموفق بود");
      setEditingId(null);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(groupId: number) {
    if (!confirm("مطمئنی می‌خوای این گروه رو حذف کنی؟")) return;
    setError("");
    setDeletingId(groupId);
    try {
      const res = await fetch(`/api/admin/groups?groupId=${groupId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "حذف ناموفق بود");
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setDeletingId(null);
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
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-extrabold">گروه‌های مگامنو</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            نوار کناری منوی دسته‌بندی‌ها در هدر فروشگاه — مثال: «کالای دیجیتال»
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={startAdd}
            className="text-sm font-bold text-white bg-dk-red hover:bg-dk-red-dark rounded-xl px-4 py-2 transition-colors"
          >
            + گروه جدید
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-xl bg-dk-red/10 text-dk-red border border-dk-red/30">
          {error}
        </div>
      )}

      {adding && (
        <div className="mb-6 rounded-2xl border p-4 flex flex-wrap items-end gap-3"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
          <div>
            <div className="text-xs font-bold mb-1">عنوان گروه</div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثلاً کالای دیجیتال"
              style={{ ...inputStyle, width: 200 }}
            />
          </div>
          <div>
            <div className="text-xs font-bold mb-1">آیکون</div>
            <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} style={{ ...inputStyle, width: 130 }}>
              {ICON_OPTIONS.map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-bold mb-1">ترتیب</div>
            <input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              style={{ ...inputStyle, width: 70 }}
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="text-sm font-bold text-white bg-dk-red rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? "در حال ثبت..." : "ثبت گروه"}
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-sm font-bold rounded-xl px-4 py-2 border transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            انصراف
          </button>
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
        {groups.length === 0 ? (
          <p className="text-sm py-16 text-center" style={{ color: "var(--text-secondary)" }}>
            هنوز گروهی تعریف نشده. با «+ گروه جدید» اولین گروه مگامنو را بساز.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                <th className="text-right px-4 py-2 font-bold">ترتیب</th>
                <th className="text-right px-4 py-2 font-bold">آیکون</th>
                <th className="text-right px-4 py-2 font-bold">عنوان</th>
                <th className="text-right px-4 py-2 font-bold">تعداد دسته</th>
                <th className="text-left px-4 py-2 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3">{g.order}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-dk-red" style={{ background: "color-mix(in srgb, #ef4050 8%, transparent)" }}>
                      {g.icon || "tag"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{g.title}</td>
                  <td className="px-4 py-3">{g._count.categories.toLocaleString("fa-IR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(g)}
                        className="text-xs font-bold rounded-lg px-3 py-1.5 border transition-colors hover:border-dk-red hover:text-dk-red"
                        style={{ borderColor: "var(--border)" }}
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        disabled={deletingId === g.id}
                        className="text-xs font-bold rounded-lg px-3 py-1.5 text-dk-red border border-dk-red/40 hover:bg-dk-red/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === g.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border p-5" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-extrabold mb-4">ویرایش گروه</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold mb-1">عنوان</div>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-xs font-bold mb-1">آیکون</div>
                  <select value={editIcon} onChange={(e) => setEditIcon(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">ترتیب</div>
                  <input type="number" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                </div>
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
