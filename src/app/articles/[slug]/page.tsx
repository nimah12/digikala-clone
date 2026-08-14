import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getArticle, getArticles } from "@/lib/articles";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return { title: article?.title ?? "مقاله یافت نشد" };
}

const BODY: Record<string, string[]> = {
  "iphone-15-review": [
    "آیفون ۱۵ با تراشه A16 Bionic و دوربین ۴۸ مگاپیکسلی، یکی از محبوب‌ترین گوشی‌های بازار در سال جاری است. در این بررسی نگاهی دقیق به طراحی، عملکرد و دوربین آن می‌اندازیم.",
    "طراحی: بدنه آلومینیومی با لبه‌های گرد، وزن حدود ۱۷۱ گرم و استاندارد IP68. صفحه‌نمایش ۶.۱ اینچی Super Retina XDR با نرخ تازه‌سازی ۶۰ هرتز، کیفیت رنگ عالی و روشنایی ۲۰۰۰ نیت دارد.",
    "عملکرد: تراشه A16 Bionic برای تمام کارهای روزمره و حتی بازی‌های سنگین بیش از اندازه قدرتمند است. iOS 17 نیز تجربه نرم و روانی ارائه می‌دهد.",
    "دوربین: دوربین اصلی ۴۸ مگاپیکسلی با ترکیب پیکسل‌ها عکس‌های ۱۲ مگاپیکسلی با جزئیات فوق‌العاده ثبت می‌کند. زوم اپتیکال ۲ برابر و حالت سینمایی نیز بهبود یافته است.",
    "جمع‌بندی: اگر به دنبال یک گوشی بالارده با دوربین عالی و پشتیبانی طولانی‌مدت هستید، آیفون ۱۵ انتخاب هوشمندانه‌ای است.",
  ],
  "m3-chip-guide": [
    "تراشه‌های M3 اپل با معماری ۳ نانومتری، جهش بزرگی در کارایی و مصرف انرژی به همراه داشته‌اند. اما کدام نسخه برای شما مناسب است؟",
    "M3 پایه: مناسب دانشجویان، کارهای اداری و کدنویسی سبک. تا ۱۸ ساعت شارژدهی و عملکرد عالی برای مک‌بوک ایر.",
    "M3 Pro: با ۱۲ هسته پردازشی و پشتیبانی از حافظه بیشتر، برای ویرایش ویدئو، فتوشاپ و پروژه‌های سنگین برنامه‌نویسی عالی است.",
    "M3 Max: قدرتمندترین نسخه، مناسب حرفه‌ای‌های ویرایش ۸K و کارهای گرافیکی سنگین. فقط در مک‌بوک پرو ۱۶ اینچی عرضه می‌شود.",
    "نکته کلیدی: اگر مطمئن نیستید، نسخه پایه با ۱۶ گیگابایت رم شروع خوبی است و برای اکثر کاربران کافی خواهد بود.",
  ],
  "airpods-vs-sony": [
    "ایرپادز پرو ۲ و سونی WH-1000XM5 دو غول نویزکنسلینگ بازار هستند. مقایسه این دو می‌تواند تصمیم خرید را آسان‌تر کند.",
    "کیفیت صدا: سونی با درایورهای بزرگ‌تر، بیس عمیق‌تر و صدای فراگیرتری ارائه می‌دهد. ایرپادز پرو صدای متعادل و طبیعی‌تری دارد.",
    "نویزکنسلینگ: سونی XM5 در حذف نویز فرکانس پایین (مانند صدای مترو) برتری جزئی دارد، اما تفاوت آن‌قدر محسوس نیست.",
    "اتصال و اکوسیستم: ایرپادز با آیفون تجربه‌ای بی‌نظیر دارد؛ سونی با بلوتوث استاندارد روی تمام دستگاه‌ها عالی کار می‌کند.",
    "جمع‌بندی: کاربران آیفون ایرپادز پرو را انتخاب کنند؛ کاربران اندروید و علاقه‌مندان به صدای پرقدرت، سونی XM5 را.",
  ],
  "smartwatch-guide": [
    "انتخاب ساعت هوشمند به سبک زندگی شما بستگی دارد. این راهنما به شما کمک می‌کند بهترین انتخاب را داشته باشید.",
    "ورزشکاران: اگر به دنبال سنجش دقیق ضربان قلب، GPS و برنامه‌های تمرینی هستید، اپل واچ سری ۹ و گلکسی واچ ۶ گزینه‌های برتر هستند.",
    "کاربران اداری: ساعت‌هایی با باتری بلندمدت و نمایشگر همیشه‌روشن، برای استفاده روزمره اداری ایده‌آل‌اند.",
    "کاربران اقتصادی: بندهای شیائومی با قیمت مناسب، امکانات پایه پایش فعالیت را ارائه می‌دهند.",
    "نکته مهم: قبل از خرید، سازگاری ساعت با گوشی خود (iOS یا اندروید) را حتماً بررسی کنید.",
  ],
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // چیدمان مقاله: بلاک‌های ساخت‌یافته (پاراگراف + تصویر + ویدئو) اگر موجود باشد، وگرنه متن ساده
  const body = article.contentBlocks && article.contentBlocks.length > 0
    ? article.contentBlocks
    : (article.content
        ? article.content.split(/\n\s*\n/).filter(Boolean).map((p) => ({ type: "p" as const, text: p }))
        : BODY[slug]?.map((p) => ({ type: "p" as const, text: p })) ?? [{ type: "p" as const, text: "متن کامل این مقاله به‌زودی منتشر می‌شود." }]);
  const relatedProducts =
    article.productSlugs.length > 0
      ? await prisma.product.findMany({
          where: { slug: { in: article.productSlugs } },
          include: { category: true },
        })
      : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav
        className="flex items-center gap-2 text-xs mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        <Link href="/" className="hover:text-dk-red">
          خانه
        </Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-dk-red">
          مقالات
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text)" }}>{article.title}</span>
      </nav>

      <article
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div
          className="relative aspect-[16/9]"
          style={{ background: "var(--bg)" }}
        >
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="p-6 md:p-8">
          <div
            className="flex items-center gap-3 text-[11px] mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              className="font-bold px-2 py-1 rounded-lg"
              style={{ background: "var(--bg)", color: "#ef4050" }}
            >
              {article.category}
            </span>
            <span>{article.date}</span>
            <span>⏱ {article.readTime}</span>
          </div>
          <h1 className="text-xl font-extrabold leading-8 mb-6">
            {article.title}
          </h1>
          <div
            className="space-y-4 text-sm leading-8"
            style={{ color: "var(--text-secondary)" }}
          >
            {body.map((b, i) =>
              b.type === "img" ? (
                <figure key={i} className="my-2">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden" style={{ background: "var(--bg)" }}>
                    <Image
                      src={b.src || ""}
                      alt="تصویر مقاله"
                      fill
                      sizes="(max-width: 768px) 100vw, 48rem"
                      className="object-cover"
                    />
                  </div>
                </figure>
              ) : b.type === "video" ? (
                <figure key={i} className="my-2">
                  <video
                    src={b.src || ""}
                    controls
                    preload="metadata"
                    className="w-full aspect-video rounded-xl border bg-black"
                    style={{ borderColor: "var(--border)" }}
                  />
                </figure>
              ) : (
                <p key={i}>{b.text}</p>
              ),
            )}
          </div>
        </div>
      </article>

      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-extrabold mb-4">
            محصولات مرتبط با این مقاله
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-extrabold mb-4">مقالات مرتبط</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            await getArticles()
          )
            .filter((a) => a.id !== slug)
            .slice(0, 3)
            .map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.id}`}
                className="group block rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="relative aspect-[16/9] overflow-hidden"
                  style={{ background: "var(--bg)" }}
                >
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold leading-5 line-clamp-2">
                    {a.title}
                  </h3>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
