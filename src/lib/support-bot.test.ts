import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleBotMessage, lookupOrderById } from "./support-bot";
import { prisma } from "@/lib/prisma";

// ---- موک‌ها ----
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    category: { findUnique: vi.fn() },
  },
}));

const mockedOrder = {
  id: 13,
  status: "delivered",
  total: 1_500_000,
  receiverName: "نیما",
  createdAt: new Date("2026-08-10T10:00:00.000Z"),
  items: [],
};

const sampleProducts = [
  { id: 1, name: "هندزفری QCY T13", slug: "qcy-t13", price: 980_000, discountPercent: 15, imageUrl: "/x.jpg", categoryId: 5, salesCount: 620, category: { slug: "audio" } },
  { id: 2, name: "ایرپادز پرو ۲", slug: "airpods-pro-2", price: 12_800_000, discountPercent: 7, imageUrl: "/y.jpg", categoryId: 5, salesCount: 812, category: { slug: "audio" } },
  { id: 3, name: "هدفون سونی XM5", slug: "sony-xm5", price: 21_000_000, discountPercent: 0, imageUrl: "/z.jpg", categoryId: 5, salesCount: 300, category: { slug: "audio" } },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------- فلوی پیگیری سفارش ----------
describe("پیگیری سفارش", () => {
  it("وقتی کاربر «پیگیری سفارشم» می‌نویسد، شماره سفارش را می‌خواهد و منتظر عدد می‌ماند", async () => {
    const { response, context } = await handleBotMessage("پیگیری سفارشم");

    expect(response.askOrderId).toBe(true);
    expect(response.text).toContain("عدد سفارش");
    expect(context.awaitingOrderId).toBe(true);
  });

  it("با عدد سفارش، جزئیات سفارش را برمی‌گرداند و کانتکست آن را نگه می‌دارد", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const { response, context } = await handleBotMessage("13");

    expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 13 }, include: { items: true } });
    expect(response.order).toEqual({
      id: 13,
      status: "delivered",
      total: 1_500_000,
      receiverName: "نیما",
      createdAt: "2026-08-10T10:00:00.000Z",
    });
    expect(response.text).toContain("سفارش #۱۳");
    expect(response.text).toContain("تحویل شده");
    expect(context.lastOrderId).toBe(13);
    expect(context.awaitingOrderId).toBe(false);
  });

  it("اعداد فارسی را هم می‌فهمد (۱۳ به‌جای 13)", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const { response } = await handleBotMessage("۱۳");

    expect(response.order?.id).toBe(13);
  });

  it("وقتی سفارشی با آن شماره پیدا نشود، پیام مناسب می‌دهد", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const { response, context } = await handleBotMessage("99999");

    expect(response.order).toBeUndefined();
    expect(response.text).toContain("پیدا نکردم");
    expect(response.links?.[0]?.href).toBe("/track-order");
    expect(context.awaitingOrderId).toBe(false);
  });

  it("در حالت انتظار شماره سفارش، پیام بدون عدد دوباره همان درخواست را می‌کند", async () => {
    // «بفرست» فقط کلمه پرکننده است — token معناداری ندارد
    const { response } = await handleBotMessage("بفرست", { awaitingOrderId: true });

    expect(response.askOrderId).toBe(true);
    expect(response.text).toContain("منتظر شماره سفارش");
  });
});

// ---------- احوال‌پرسی ----------
describe("احوال‌پرسی (سلام)", () => {
  it("«سلام» احوال‌پرسی برمی‌گرداند و محصولی نمی‌دهد", async () => {
    const { response } = await handleBotMessage("سلام");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/بخیر|در خدمت|خوش اومدید/);
  });

  it("«سلام خوبی؟» هم احوال‌پرسی حساب می‌شود", async () => {
    const { response } = await handleBotMessage("سلام خوبی؟");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/بخیر|در خدمت|خوش اومدید/);
  });

  it("«سلام هدفون می‌خوام» نه احوال‌پرسی است و نه جستجوی محصول — پاسخ پیش‌فرض می‌گیرد", async () => {
    const { response } = await handleBotMessage("سلام هدفون می‌خوام");

    expect(response.products).toBeUndefined();
    expect(response.text).toContain("ببخشید");
  });

  it("«درود بر شما» هم سلام است", async () => {
    const { response } = await handleBotMessage("درود بر شما");

    // پاسخ‌ها متغیرند — هر سه شامل «بخیر» یا «در خدمت» هستند و هیچ‌کدام جستجوی محصول نیست
    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/بخیر|در خدمت|خوش اومدید/);
  });

  it("سلام بر اساس ساعت روز مناسب می‌دهد", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T09:00:00")); // ۹ صبح
    const morning = await handleBotMessage("سلام");
    expect(morning.response.text).toContain("صبح‌تون بخیر");

    vi.setSystemTime(new Date("2026-08-14T14:00:00")); // ۲ بعدازظهر
    const noon = await handleBotMessage("سلام");
    expect(noon.response.text).toContain("ظهر بخیر");
    vi.useRealTimers();
  });
});

// ---------- خداحافظی ----------
describe("خداحافظی", () => {
  it("«خداحافظ» را مثل آدم جواب می‌دهد و محصولی نمی‌آورد", async () => {
    const { response } = await handleBotMessage("خداحافظ");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/خداحافظ|در خدمت|به امید دیدار|همین‌جاییم/);
  });

  it("«مرسی که کمک کردی» را با خداحافظی جواب می‌دهد", async () => {
    const { response } = await handleBotMessage("مرسی که کمک کردی");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/خداحافظ|در خدمت|به امید دیدار|همین‌جاییم/);
  });

  it("«خدا نگهدار» هم خداحافظی است", async () => {
    const { response } = await handleBotMessage("خدا نگهدار");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/خداحافظ|در خدمت|به امید دیدار|همین‌جاییم/);
  });

  it("«ممنون» ساده همچنان تشکر است نه خداحافظی", async () => {
    const { response } = await handleBotMessage("ممنون");

    expect(response.products).toBeUndefined();
    expect(response.text).not.toMatch(/به امید دیدار/);
  });
});

// ---------- ادامه گفتگو درباره سفارش قبلی ----------
describe("ادامه گفتگو (کانتکست سفارش)", () => {
  it("«وضعیتش چطوره؟» بعد از پیگیری، همان سفارش قبلی را نشان می‌دهد", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const { response } = await handleBotMessage("وضعیتش چطوره؟", { lastOrderId: 13 });

    expect(response.order?.id).toBe(13);
    expect(response.text).toContain("سفارش #۱۳");
    expect(response.text).toContain("قبلاً براتون پیدا کردم");
  });

  it("«مرجوعش کن» برای همان سفارش، شرایط مرجوعی را می‌گوید", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const { response } = await handleBotMessage("مرجوعش کن", { lastOrderId: 13 });

    expect(response.text).toContain("مرجوعی سفارش #۱۳");
    expect(response.links?.[0]?.href).toBe("/profile?tab=orders");
  });

  it("«لغوش کن» برای همان سفارش، وضعیت و راهنمای لغو را می‌گوید", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const { response } = await handleBotMessage("لغوش کن", { lastOrderId: 13 });

    expect(response.text).toContain("سفارش #۱۳");
    expect(response.text).toContain("درخواست لغو");
  });

  it("بدون کانتکست سفارش قبلی، «وضعیتش چطوره؟» به پاسخ پیش‌فرض می‌افتد", async () => {
    const { response } = await handleBotMessage("وضعیتش چطوره؟");

    // بدون lastOrderId نباید به برنچ ادامه گفتگو برود
    expect(response.text.length).toBeGreaterThan(0);
    expect(response.order).toBeUndefined();
  });
});

// ---------- چهار موضوع اصلی ربات (بدون جستجوی محصول) ----------
describe("چهار موضوع اصلی (بدون جستجو)", () => {
  it("«تخفیف‌ها» محصولات دارای تخفیف را برمی‌گرداند و سوال پیگیری می‌پرسد", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue(sampleProducts as never);

    const { response, context } = await handleBotMessage("تخفیف‌ها");

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { discountPercent: { gt: 0 } } }),
    );
    expect(response.products?.length).toBe(3);
    expect(response.text).toContain("تخفیف");
    expect(response.text).toContain("مایلید این محصول رو سفارش بدید؟");
    expect(context.lastSuggestedProducts?.length).toBe(3);
  });

  it("«پرفروش‌ترین‌ها» پرفروش‌ترین محصولات را برمی‌گرداند و سوال پیگیری می‌پرسد", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue(sampleProducts as never);

    const { response, context } = await handleBotMessage("پرفروش‌ترین‌ها");

    expect(response.products?.length).toBe(3);
    expect(response.text).toContain("پرفروش");
    expect(response.text).toContain("مایلید این محصول رو سفارش بدید؟");
    expect(context.lastSuggestedProducts?.length).toBe(3);
  });

  it("«بله» بعد از تخفیف/پرفروش، راهنمای سفارش و دوباره محصولات را می‌دهد", async () => {
    const suggested = sampleProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPercent: p.discountPercent,
      imageUrl: p.imageUrl,
    }));

    const { response } = await handleBotMessage("بله", { lastSuggestedProducts: suggested });

    expect(response.text).toContain("افزودن به سبد");
    expect(response.products?.length).toBe(3);
    expect(response.links?.[0]?.href).toBe("/cart");
  });

  it("«نه» بعد از پیشنهاد، مودبانه پاسخ می‌دهد و محصولی نمی‌دهد", async () => {
    const suggested = sampleProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPercent: p.discountPercent,
      imageUrl: p.imageUrl,
    }));

    const { response } = await handleBotMessage("نه ممنون", { lastSuggestedProducts: suggested });

    expect(response.text).toContain("باشه");
    expect(response.products).toBeUndefined();
  });

  it("«بله» بدون پیشنهاد قبلی، پاسخ پیش‌فرض می‌گیرد نه فلوی سفارش", async () => {
    const { response } = await handleBotMessage("بله");

    expect(response.products).toBeUndefined();
    expect(response.text).toContain("ببخشید");
  });

  it("«شرایط مرجوعی» شرایط بازگشت کالا را توضیح می‌دهد", async () => {
    const { response } = await handleBotMessage("شرایط مرجوعی");

    expect(response.text).toContain("۷ روز");
    expect(response.links?.[0]?.href).toBe("/returns");
  });

  it("«هدفون می‌خوام» جستجو نیست — محصول نمی‌آورد و پاسخ پیش‌فرض با ۴ موضوع می‌دهد", async () => {
    const { response } = await handleBotMessage("هدفون می‌خوام");

    expect(response.products).toBeUndefined();
    expect(response.text).toContain("پیگیری سفارشم");
    expect(response.text).toContain("تخفیف‌ها");
    expect(prisma.category.findUnique).not.toHaveBeenCalled();
  });
});

// ---------- lookupOrderById ----------
describe("lookupOrderById", () => {
  it("سفارش موجود را برمی‌گرداند", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockedOrder as never);

    const order = await lookupOrderById(13);

    expect(order?.id).toBe(13);
    expect(order?.createdAt).toBe("2026-08-10T10:00:00.000Z");
  });

  it("برای سفارش ناموجود null برمی‌گرداند", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const order = await lookupOrderById(999);

    expect(order).toBeNull();
  });
});
