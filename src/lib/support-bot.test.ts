import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleBotMessage, lookupOrderById } from "./support-bot";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/lib/search";

// ---- موک‌ها ----
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    category: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/search", () => ({
  // پیش‌فرض: بدون نتیجه — هر تستی که نیاز دارد مقدار خودش را set می‌کند
  searchProducts: vi.fn().mockResolvedValue([]),
}));

const mockedOrder = {
  id: 13,
  status: "delivered",
  total: 1_500_000,
  receiverName: "نیما",
  createdAt: new Date("2026-08-10T10:00:00.000Z"),
  items: [],
};

const audioProducts = [
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
  it("«سلام» به‌جای جستجوی محصول، احوال‌پرسی برمی‌گرداند و محصولی نمی‌دهد", async () => {
    // جستجوی آزاد هرگز نباید صدا زده شود
    vi.mocked(searchProducts).mockResolvedValue([
      { name: "محصول سلام", slug: "salam", price: 1000, discountPercent: 0, imageUrl: null, category: { slug: "x" } } as never,
    ]);

    const { response } = await handleBotMessage("سلام");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/بخیر|در خدمت|خوش اومدید/);
    expect(searchProducts).not.toHaveBeenCalled();
  });

  it("«سلام خوبی؟» هم احوال‌پرسی حساب می‌شود", async () => {
    const { response } = await handleBotMessage("سلام خوبی؟");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/بخیر|در خدمت|خوش اومدید/);
  });

  it("«سلام هدفون می‌خوام» همچنان جستجوی محصول است نه احوال‌پرسی", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 5, slug: "audio" } as never);
    vi.mocked(prisma.product.findMany).mockResolvedValue(audioProducts as never);

    const { response } = await handleBotMessage("سلام هدفون می‌خوام");

    expect(response.products?.length).toBe(3);
    expect(response.text).toContain("هدفون");
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
  it("«خداحافظ» را مثل آدم جواب می‌دهد و جستجوی محصول نمی‌کند", async () => {
    const { response } = await handleBotMessage("خداحافظ");

    expect(response.products).toBeUndefined();
    expect(response.text).toMatch(/خداحافظ|در خدمت|به امید دیدار|همین‌جاییم/);
    expect(searchProducts).not.toHaveBeenCalled();
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

  it("بدون کانتکست سفارش قبلی، «وضعیتش چطوره؟» به سوال‌های دیگر می‌افتد و پیام پیش‌فرض نمی‌دهد", async () => {
    const { response } = await handleBotMessage("وضعیتش چطوره؟");

    // بدون lastOrderId نباید به برنچ ادامه گفتگو برود — جواب کلی (مثلاً «شعبه نداریم») می‌گیرد
    expect(response.text.length).toBeGreaterThan(0);
    expect(response.order).toBeUndefined();
  });
});

// ---------- نتایج قبلی محصولات ----------
describe("نتایج قبلی جستجو", () => {
  it("«هدفون می‌خوام» از دسته audio محصول برمی‌گرداند و کانتکست نتایج را نگه می‌دارد", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 5, slug: "audio" } as never);
    vi.mocked(prisma.product.findMany).mockResolvedValue(audioProducts as never);

    const { response, context } = await handleBotMessage("هدفون می‌خوام");

    expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { slug: "audio" } });
    expect(response.products?.length).toBe(3);
    expect(context.lastProducts?.length).toBe(3);
  });

  it("«ارزون‌ترینش؟» (بدون نیم‌فاصله) ارزان‌ترین نتیجه قبلی را می‌گوید", async () => {
    const lastProducts = audioProducts.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));

    const { response } = await handleBotMessage("ارزونترینش؟", { lastProducts });

    expect(response.text).toContain("ارزون‌ترینشون «هندزفری QCY T13»");
    expect(response.text).toContain("۹۸۰٬۰۰۰");
  });

  it("«ارزون‌ترینش؟» با نیم‌فاصله هم کار می‌کند", async () => {
    const lastProducts = audioProducts.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));

    const { response } = await handleBotMessage("ارزون‌ترینش؟", { lastProducts });

    expect(response.text).toContain("هندزفری QCY T13");
  });

  it("«گرون‌ترینش؟» گران‌ترین نتیجه قبلی را می‌گوید", async () => {
    const lastProducts = audioProducts.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));

    const { response } = await handleBotMessage("گرون‌ترینش؟", { lastProducts });

    expect(response.text).toContain("ارزون‌ترینشون".replace("ارزون", "گرون"));
    expect(response.text).toContain("هدفون سونی XM5");
    expect(response.text).toContain("۲۱٬۰۰۰٬۰۰۰");
  });

  it("بدون نتایج قبلی، «ارزون‌ترینش؟» به‌جای پیام خطا به برنچ تخفیف می‌رود", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue(audioProducts as never);

    const { response } = await handleBotMessage("ارزون‌ترینش؟");

    // چون کلمه «ارزون» با برنچ تخفیف تطبیق دارد، پاسخ تخفیف می‌گیرد نه پیام پیش‌فرض
    expect(response.products).toBeDefined();
    expect(response.text).toContain("تخفیف");
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
