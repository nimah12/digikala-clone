import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/reset-token";
import { sendEmail, emailLayout } from "@/lib/email";
import { ipKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // محدودیت: ۵ ایمیل بازیابی در هر ۱۵ دقیقه به ازای هر IP (ضد email bombing)
  const rl = rateLimit(ipKey(request), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.ok) {
    return Response.json(
      { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier?.trim()) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const identifierStr = identifier.trim().toLowerCase();
    const isPhone = /^09\d{9}$/.test(identifierStr.replace(/[^\d]/g, ""));

    let user = null;
    if (isPhone) {
      const phone = identifierStr.replace(/[^\d]/g, "");
      user = await prisma.user.findUnique({ where: { phone } });
    } else {
      user = await prisma.user.findUnique({ where: { email: identifierStr } });
    }

    // برای امنیت، همیشه پیام موفقیت برمی‌گردانیم حتی اگر کاربر نباشد
    if (!user?.email || user.email.endsWith("@phone.local")) {
      return Response.json({ success: true });
    }

    // توکن یک‌بارمصرف (امضاشده) + لینک بازیابی
    const token = createResetToken(user.id, user.email);
    const resetUrl = `${request.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;

    const html = emailLayout(
      "بازیابی رمز عبور",
      `<p>سلام ${user.name ?? "کاربر عزیز"}،</p>
       <p>برای بازیابی رمز عبور حساب خود در دیجی‌کلون، روی دکمه زیر کلیک کنید:</p>
       <p style="text-align:center;margin:24px 0">
         <a href="${resetUrl}" style="display:inline-block;background:#ef4050;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:bold">بازیابی رمز عبور</a>
       </p>
       <p>این لینک تا <b>۱ ساعت</b> معتبر است. اگر شما درخواست بازیابی نداده‌اید، این ایمیل را نادیده بگیرید.</p>
       <p style="font-size:11px;color:#a1a3a8;word-break:break-all;direction:ltr;text-align:left">${resetUrl}</p>`,
    );

    const result = await sendEmail({ to: user.email, subject: "بازیابی رمز عبور — دیجی‌کلون", html });
    if (!result.ok) {
      // در حالت بدون کلید/دامنه تأییدنشده، لینک در لاگ ثبت می‌شود تا توسعه ادامه پیدا کند
      console.log(`[forgot-password] لینک بازیابی برای ${user.email}: ${resetUrl}`);
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
