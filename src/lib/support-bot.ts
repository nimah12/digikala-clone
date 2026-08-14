import { prisma } from "@/lib/prisma";
import { faNormalize } from "@/lib/normalize";
import { searchProducts } from "@/lib/search";
import { formatPrice } from "@/lib/format";
import { formatIranDate, getIranHour } from "@/lib/iran-time";
import { BOT_CONFIG, renderText, pick, type BotLink } from "@/lib/support-bot-config";

export type BotResponse = {
  text: string;
  products?: { name: string; slug: string; price: number; discountPercent: number; imageUrl: string | null }[];
  order?: { id: number; status: string; total: number; receiverName: string; createdAt: string } | null;
  askOrderId?: boolean;
  links?: BotLink[];
};

// کانتکست گفتگو — بین پیام‌های یک جلسه حفظ می‌شود
export type BotContext = {
  // آخرین سفارشی که کاربر پیگیری کرد (برای سوال‌های بعدی مثل «وضعیتش چطوره؟»)
  lastOrderId?: number | null;
  // منتظر فرستادن شماره سفارش هستیم
  awaitingOrderId?: boolean;
  // نتایج آخرین پاسخ محصول (برای «ارزون‌ترینش» و...)
  lastProducts?: { name: string; slug: string; price: number }[];
};

const { statusLabels, generalAnswers, categoryQueries } = BOT_CONFIG;

// کلمات پرکننده برای تشخیص جستجوی معنادار
function meaningfulTokens(q: string): string[] {
  return q.split(" ").filter((t) => t.length >= 2 && !BOT_CONFIG.fillerWords.includes(t));
}

export async function lookupOrderById(id: number): Promise<BotResponse["order"]> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    receiverName: order.receiverName,
    createdAt: order.createdAt.toISOString(),
  };
}

// ساخت پاسخ برای سفارش — هم در پاسخ اولیه و هم در ادامه گفتگو استفاده می‌شود
function orderReply(order: { id: number; status: string; total: number; receiverName: string; createdAt: string }): string {
  return renderText(BOT_CONFIG.orderReplyTemplate, {
    id: order.id.toLocaleString("fa-IR"),
    status: statusLabels[order.status] ?? order.status,
    receiver: order.receiverName,
    total: formatPrice(order.total),
    date: formatIranDate(new Date(order.createdAt)),
  });
}

export async function handleBotMessage(
  message: string,
  context: BotContext = {},
): Promise<{ response: BotResponse; context: BotContext }> {
  const q = faNormalize(message);
  const nextContext: BotContext = { ...context };
  // ۱) اگر پیام فقط یک عدد است (شماره سفارش) — صرف‌نظر از تعداد ارقام
  const digitsOnly = q.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^0-9]/g, "");
  const isOnlyDigits = digitsOnly.length > 0 && digitsOnly.length === q.length;
  if (isOnlyDigits && digitsOnly.length <= 6) {
    const id = Number(digitsOnly);
    const order = await lookupOrderById(id);
    if (!order) {
      nextContext.awaitingOrderId = false;
      return {
        response: {
          text: renderText(BOT_CONFIG.orderNotFound, { id: id.toLocaleString("fa-IR") }),
          links: [BOT_CONFIG.orderNotFoundLink],
        },
        context: nextContext,
      };
    }
    nextContext.lastOrderId = order.id;
    nextContext.awaitingOrderId = false;
    return { response: { text: orderReply(order), order }, context: nextContext };
  }

  // ۱.۵) ادامه گفتگو درباره آخرین سفارش — «وضعیتش چطوره؟»، «همون سفارش»، «کجاست؟» و...
  const lastOrderFollowUp = /(همون سفارش|این سفارش|سفارش قبلی|وضعیتش|وضعیتش چطور|کجاست|کجا رسید|رسید|بازگشت|مرجوع|لغوش کن|لغو کن|پیکش|پیک|تحویلش|کد رهگیری)/.test(q);
  if (context.lastOrderId && lastOrderFollowUp) {
    const order = await lookupOrderById(context.lastOrderId);
    if (order) {
      // پاسخ مخصوص «بازگشت/مرجوع» برای همان سفارش
      if (/(بازگشت|مرجوع|پس‌داد)/.test(q)) {
        return {
          response: {
            text: renderText(BOT_CONFIG.orderReturn, { id: order.id.toLocaleString("fa-IR") }),
            links: [BOT_CONFIG.orderReturnLink],
          },
          context: nextContext,
        };
      }
      if (/(لغو)/.test(q)) {
        return {
          response: {
            text: renderText(BOT_CONFIG.orderCancel, {
              id: order.id.toLocaleString("fa-IR"),
              status: statusLabels[order.status] ?? order.status,
            }),
            links: [BOT_CONFIG.orderCancelLink],
          },
          context: nextContext,
        };
      }
      return {
        response: {
          text: renderText(BOT_CONFIG.orderFollowUp, {
            id: order.id.toLocaleString("fa-IR"),
            reply: orderReply(order),
          }),
          order,
        },
        context: nextContext,
      };
    }
  }

  // ۱.۷) سوال درباره نتایج محصول قبلی — «ارزون‌ترینش؟»، «گرون‌ترینش؟»، «کدومش بهتره؟»
  // (نیم‌فاصله در نوشته کاربر اختیاری است — هم «ارزون‌ترین» و هم «ارزونترین» را می‌گیرد)
  if (context.lastProducts && context.lastProducts.length > 0 && /(ارزون(?:‌)?ترین|گرون(?:‌)?ترین|گران(?:‌)?ترین|کدومش بهتره|کدومشون|بهترینش|قیمتش)/.test(q)) {
    const sorted = [...context.lastProducts].sort((a, b) => a.price - b.price);
    const isCheapest = /(ارزون(?:‌)?ترین|قیمتش)/.test(q);
    const target = isCheapest ? sorted[0] : sorted[sorted.length - 1];
    return {
      response: {
        text: renderText(isCheapest ? BOT_CONFIG.cheapestResult : BOT_CONFIG.expensiveResult, {
          name: target.name,
          price: formatPrice(target.price),
        }),
        products: context.lastProducts.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPercent: 0,
          imageUrl: null,
        })),
      },
      context: nextContext,
    };
  }

  // ۲) پیگیری سفارش (درخواست شماره سفارش)
  if (/(پیگیری|رهگیری|وضعیت سفارش|کد رهگیری|ردیابی|سفارشم کجاست|سفارش رو|پیگیری سفارش)/.test(q)) {
    nextContext.awaitingOrderId = true;
    return {
      response: {
        text: BOT_CONFIG.askOrderId,
        askOrderId: true,
        links: [BOT_CONFIG.askOrderIdLink],
      },
      context: nextContext,
    };
  }

  // ۲.۵) اگر منتظر شماره سفارش بودیم ولی کاربر عدد نفرستاد
  if (context.awaitingOrderId && meaningfulTokens(q).length === 0) {
    return {
      response: {
        text: BOT_CONFIG.awaitingOrderId,
        askOrderId: true,
        links: [BOT_CONFIG.awaitingOrderIdLink],
      },
      context: nextContext,
    };
  }

  // ۳) تخفیف‌ها — محصولات واقعی دارای تخفیف
  if (/(تخفیف|حراج|جشنواره|کد تخفیف|کوپن|شگفت‌انگیز|ویژه|ارزون|ارزان)/.test(q)) {
    const deals = await prisma.product.findMany({
      where: { discountPercent: { gt: 0 } },
      orderBy: { discountPercent: "desc" },
      take: 6,
    });
    if (deals.length > 0) {
      nextContext.lastProducts = deals.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));
      return {
        response: {
          text: renderText(BOT_CONFIG.dealsIntro, { count: deals.length }) + (q.includes("کد تخفیف") ? BOT_CONFIG.dealsCouponNote : ""),
          products: deals.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            discountPercent: p.discountPercent,
            imageUrl: p.imageUrl,
          })),
          links: [BOT_CONFIG.dealsLink],
        },
        context: nextContext,
      };
    }
  }

  // ۴) پرفروش‌ترین‌ها
  if (/(پرفروش|محبوب|معروف|بهترین‌ها|بالاترین فروش|بیشترین فروش|فروش بالا)/.test(q) || /\b(top|best|popular)\b/.test(q)) {
    const best = await prisma.product.findMany({
      orderBy: { salesCount: "desc" },
      take: 5,
    });
    nextContext.lastProducts = best.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));
    return {
      response: {
        text: BOT_CONFIG.bestsellersIntro,
        products: best.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPercent: p.discountPercent,
          imageUrl: p.imageUrl,
        })),
        links: [BOT_CONFIG.bestsellersLink],
      },
      context: nextContext,
    };
  }

  // ۵) جستجوی محصول بر اساس دسته‌بندی یا عبارت آزاد
  for (const c of categoryQueries) {
    if (c.keywords.some((k) => q.includes(k))) {
      let products;
      if (c.category) {
        const cat = await prisma.category.findUnique({ where: { slug: c.category } });
        if (cat) {
          products = await prisma.product.findMany({
            where: { categoryId: cat.id },
            include: { category: true },
            orderBy: [{ discountPercent: "desc" }, { salesCount: "desc" }],
            take: 6,
          });
        }
      } else {
        products = await searchProducts(c.query || q, 6);
      }
      if (!products || products.length === 0) continue;
      nextContext.lastProducts = products.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));
      return {
        response: {
          text: pick(BOT_CONFIG.categoryIntros.map((tpl) => renderText(tpl, { title: c.title }))),
          products: products.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            discountPercent: p.discountPercent,
            imageUrl: p.imageUrl,
          })),
        },
        context: nextContext,
      };
    }
  }

  // ۶) احوال‌پرسی — قبل از جستجو تا «سلام» به‌جای محصول، سلام برگرداند
  // فقط وقتی واقعاً احوال‌پرسی است: حتماً کلمه سلام دارد و بقیه کلماتش هم سلام/خوش‌آمد است
  const GREETING_RE = /(سلام|درود|علیک|hello|\bhi\b|صبح(تون)? بخیر|ظهر(تون)? بخیر|عصر(تون)? بخیر|شب(تون)? بخیر)/;
  // نکته: برای کلمات فارسی از \b استفاده نمی‌شود چون boundary فقط برای حروف لاتین کار می‌کند؛
  // توکن‌ها از قبل با فاصله جدا شده‌اند پس کافی است زیررشته باشد
  const GREETING_EXTRAS_RE = /(خوبی|چطوری|چطورید|چطور|حالت|حال|چه خبر|ممنون|مرسی|بر|شما|خوش اومدی|خوش آمدید|علیکم|خسته نباشی|خسته نباشید)/;
  const greetingTokens = meaningfulTokens(q);
  const isGreeting =
    GREETING_RE.test(q) &&
    greetingTokens.every((t) => GREETING_RE.test(t) || GREETING_EXTRAS_RE.test(t));
  if (isGreeting) {
    // ساعت به وقت ایران — تا نصف‌شب پیام بدی «شب بخیر» بگوید نه «صبح بخیر»
    const h = getIranHour();
    const salutation = h >= 5 && h < 12 ? "صبح‌تون بخیر" : h >= 12 && h < 17 ? "ظهر بخیر" : h >= 17 && h < 22 ? "عصرتون بخیر" : "شب بخیر";
    return {
      response: {
        text: pick(BOT_CONFIG.greetings.map((tpl) => renderText(tpl, { salutation, agent: BOT_CONFIG.agentName }))),
      },
      context: nextContext,
    };
  }

  // ۷) خداحافظی — قبل از تشکر تا «مرسی که کمک کردی» هم خداحافظی جواب بدهد
  if (BOT_CONFIG.farewellKeywords.some((k) => q.includes(k))) {
    return {
      response: {
        text: pick(BOT_CONFIG.farewells.map((tpl) => renderText(tpl, { agent: BOT_CONFIG.agentName }))),
      },
      context: nextContext,
    };
  }

  // ۸) تشکر
  if (/(تشکر|ممنون|مرسی|دمت|خسته نباشی|ممنونم|ممنونم)/.test(q)) {
    return {
      response: {
        text: pick(BOT_CONFIG.thanks),
      },
      context: nextContext,
    };
  }

  // ۹) پاسخ‌های ثابت عمومی
  for (const item of generalAnswers) {
    if (item.keywords.some((k) => q.includes(k))) {
      return { response: { text: item.answer, links: item.links }, context: nextContext };
    }
  }

  // ۱۰) جستجوی آزاد: اگر کلمه‌ای غیر از پرکننده‌ها داشت
  const meaningful = meaningfulTokens(q);
  if (meaningful.length > 0) {
    const query = meaningful.join(" ");
    const results = await searchProducts(query, 5);
    if (results.length > 0) {
      nextContext.lastProducts = results.map((p) => ({ name: p.name, slug: p.slug, price: p.price }));
      return {
        response: {
          text: pick(BOT_CONFIG.searchIntros.map((tpl) => renderText(tpl, { query }))),
          products: results.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            discountPercent: p.discountPercent,
            imageUrl: p.imageUrl,
          })),
        },
        context: nextContext,
      };
    }
  }

  // ۱۱) پاسخ پیش‌فرض
  return {
    response: {
      text: BOT_CONFIG.defaultReply,
    },
    context: nextContext,
  };
}
