import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";
import { signAuthToken } from "@/lib/auth";
import { ipKey, rateLimit } from "@/lib/rate-limit";
import {
  computeServerLockState,
  isAccountLocked,
  lockRemainingSeconds,
} from "@/lib/login-lockout";

export async function POST(request: NextRequest) {
  // محدودیت: ۱۰ تلاش ناموفق احتمالی در هر ۱۵ دقیقه به ازای هر IP
  const rl = rateLimit(ipKey(request), { limit: 20, windowMs: 15 * 60 * 1000 });
  if (!rl.ok) {
    return Response.json(
      { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs ?? 0) / 1000)) },
      },
    );
  }
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    // جستجو بر اساس ایمیل یا شماره موبایل
    const identifierStr = identifier.trim().toLowerCase();
    const isPhone = /^09\d{9}$/.test(identifierStr.replace(/[^\d]/g, ""));

    let user = null;
    if (isPhone) {
      const phone = identifierStr.replace(/[^\d]/g, "");
      user = await prisma.user.findUnique({ where: { phone } });
    } else {
      user = await prisma.user.findUnique({ where: { email: identifierStr } });
    }

    // چک قفل حساب: اگر بعد از ۵ تلاش ناموفق قفل شده باشد، حتی با رمز درست هم
    // ورود رد می‌شود تا زمان باقی‌مانده. پاسخ با 429 می‌آید تا کلاینت
    // شمارش معکوس را نشان دهد.
    if (user && isAccountLocked(user.lockedUntil)) {
      const retryAfter = lockRemainingSeconds(user.lockedUntil);
      return Response.json(
        {
          success: false,
          error: "به دلیل تلاش‌های ناموفق زیاد، حساب موقتاً قفل شده است. کمی بعد دوباره تلاش کنید.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    // چک رمز عبور — پاسخ برای «کاربر ناموجود» و «رمز اشتباه» یکسان است
    // تا مهاجم نتواند بفهمد کدام ایمیل/شماره ثبت شده (ضد user enumeration)
    const badCredentials = () =>
      Response.json(
        { success: false, error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است" },
        { status: 401 },
      );

    if (!user || !user.password) {
      return badCredentials();
    }
    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      // ثبت تلاش ناموفق در دیتابیس (ضد بروت‌فورس به ازای حساب)
      const { nextCount, lockedUntilMs } = computeServerLockState(user.failedLoginCount);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: nextCount,
          lockedUntil: lockedUntilMs > 0 ? new Date(lockedUntilMs) : null,
        },
      });
      return badCredentials();
    }

    // ورود موفق: ریست شمارنده و قفل
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: null },
      });
    }

    // ارتقای رمزهای متنی قدیمی به هش در اولین ورود موفق
    if (!isHashedPassword(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password) },
      });
    }

    return Response.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token: signAuthToken(user.id),
    });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}