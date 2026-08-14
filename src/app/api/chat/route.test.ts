import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "./route";
import { prisma } from "@/lib/prisma";
import { handleBotMessage } from "@/lib/support-bot";

// ---- موک‌ها ----
vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatSession: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

// ربات را موک می‌کنیم تا تست روی ذخیره/بازیابی جلسه متمرکز باشد
vi.mock("@/lib/support-bot", () => ({
  handleBotMessage: vi.fn(),
}));

type StoredMsg = { from: "user" | "bot"; text: string; at: string };
const nowIso = "2026-08-14T10:00:00.000Z";

function makePostRequest(body: unknown, url = "http://localhost:3000/api/chat"): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(handleBotMessage).mockResolvedValue({
    response: { text: "پاسخ آزمایشی ربات" },
    context: {},
  });
});

// ---------- POST: ذخیره جلسه ----------
describe("POST /api/chat — ذخیره جلسه", () => {
  it("بدون sessionId یک جلسه جدید می‌سازد، پیام را ذخیره و sessionId جدید برمی‌گرداند", async () => {
    // upsert را با مقدار پیش‌فرض موک می‌کنیم — بعد از فراخوانی، آرگومان‌ها را از mock.calls می‌خوانیم
    vi.mocked(prisma.chatSession.upsert).mockResolvedValue({ id: "" } as never);
    vi.mocked(prisma.chatSession.findUnique).mockResolvedValue(null);

    const res = await POST(makePostRequest({ message: "سلام" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // upsert باید با یک id جدید (randomUUID) صدا زده شود — نه id خالی
    const upsertCall = vi.mocked(prisma.chatSession.upsert).mock.calls[0][0];
    const createdId = (upsertCall.create as { id: string }).id;
    expect(createdId.length).toBeGreaterThan(0);
    expect(data.sessionId).toBe(createdId);

    // پیام کاربر و پاسخ ربات باید ذخیره شود
    const stored = upsertCall.create.messages as StoredMsg[];
    expect(stored.length).toBe(2);
    expect(stored[0]).toMatchObject({ from: "user", text: "سلام" });
    expect(stored[1]).toMatchObject({ from: "bot", text: "پاسخ آزمایشی ربات" });
  });

  it("با sessionId موجود، پیام جدید به تاریخچه قبلی اضافه می‌شود", async () => {
    const existing: StoredMsg[] = [
      { from: "user", text: "سلام قبلی", at: nowIso },
      { from: "bot", text: "پاسخ قبلی", at: nowIso },
    ];
    vi.mocked(prisma.chatSession.findUnique).mockResolvedValue({
      id: "session-abc",
      messages: existing,
      context: {},
    } as never);

    await POST(makePostRequest({ message: "سلام", sessionId: "session-abc" }));

    const upsertCall = vi.mocked(prisma.chatSession.upsert).mock.calls[0][0];
    expect(upsertCall.where).toEqual({ id: "session-abc" });
    const stored = upsertCall.update.messages as StoredMsg[];
    expect(stored.length).toBe(4);
    expect(stored[2]).toMatchObject({ from: "user", text: "سلام" });
    expect(stored[3]).toMatchObject({ from: "bot", text: "پاسخ آزمایشی ربات" });
  });

  it("پیام خالی با خطای 400 رد می‌شود و چیزی ذخیره نمی‌شود", async () => {
    const res = await POST(makePostRequest({ message: "   " }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(prisma.chatSession.upsert).not.toHaveBeenCalled();
  });

  it("کانتکست برگشتی ربات در جلسه ذخیره می‌شود", async () => {
    vi.mocked(handleBotMessage).mockResolvedValue({
      response: { text: "پیگیری سفارش", askOrderId: true },
      context: { awaitingOrderId: true },
    });
    vi.mocked(prisma.chatSession.findUnique).mockResolvedValue(null);

    await POST(makePostRequest({ message: "پیگیری سفارشم" }));

    const upsertCall = vi.mocked(prisma.chatSession.upsert).mock.calls[0][0];
    expect(upsertCall.create.context).toEqual({ awaitingOrderId: true });
  });

  it("خطای سرور با پیام دوستانه و status 200 برمی‌گردد", async () => {
    vi.mocked(handleBotMessage).mockRejectedValue(new Error("db down"));

    const res = await POST(makePostRequest({ message: "سلام" }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.text).toContain("دوباره تلاش");
  });
});

// ---------- GET: بازیابی جلسه ----------
describe("GET /api/chat — بازیابی جلسه", () => {
  it("با sessionId معتبر، تاریخچه کامل برمی‌گردد", async () => {
    const history: StoredMsg[] = [
      { from: "user", text: "سلام", at: nowIso },
      { from: "bot", text: "سلام! چطور می‌تونم کمکت کنم؟", at: nowIso },
    ];
    vi.mocked(prisma.chatSession.findUnique).mockResolvedValue({
      id: "session-abc",
      messages: history,
      context: {},
    } as never);

    const req = new NextRequest("http://localhost:3000/api/chat?sessionId=session-abc");
    const res = await GET(req);
    const data = await res.json();

    expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({ where: { id: "session-abc" } });
    expect(data.success).toBe(true);
    expect(data.messages).toEqual(history);
  });

  it("بدون sessionId، تاریخچه خالی برمی‌گردد", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.messages).toEqual([]);
    expect(prisma.chatSession.findUnique).not.toHaveBeenCalled();
  });

  it("برای sessionId ناموجود، آرایه خالی برمی‌گردد نه خطا", async () => {
    vi.mocked(prisma.chatSession.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/chat?sessionId=not-found");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.messages).toEqual([]);
  });
});
