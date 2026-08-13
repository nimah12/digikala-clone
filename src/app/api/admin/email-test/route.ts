import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY در محیط سرور تنظیم نشده است." },
      { status: 400 },
    );
  }

  const to =
    process.env.ADMIN_EMAIL ||
    (await prisma.user.findFirst({ where: { role: "admin" }, select: { email: true } }))?.email;

  if (!to) {
    return NextResponse.json(
      { error: "ایمیلی برای ارسال تست پیدا نشد (ADMIN_EMAIL یا ادمین دیتابیس)." },
      { status: 400 },
    );
  }

  const html = emailLayout(
    "ایمیل آزمایشی",
    `<p>این یک <b>ایمیل آزمایشی</b> از فروشگاه دیجی‌کلون است.</p>
     <p>اگر این ایمیل را دریافت کرده‌اید، یعنی سیستم ارسال ایمیل (Resend) به‌درستی کار می‌کند. ✅</p>`,
  );

  const result = await sendEmail({
    to,
    subject: "تست ایمیل — دیجی‌کلون",
    html,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, to: to.replace(/^(.).*(@.*)$/, "$1***$2") });
}
