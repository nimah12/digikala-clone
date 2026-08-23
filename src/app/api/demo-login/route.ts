import { NextRequest } from "next/server";
import { signAuthToken } from "@/lib/auth";
import { DEMO_ROLE } from "@/lib/admin";

const DEMO_EMAIL = "demo@digikala-clone.local";
const DEMO_NAME = "کاربر دمو";
const FALLBACK_DEMO_ID = 999999;

export async function POST(_request: NextRequest) {
  // در production دکمه‌ی «ورود دمو» غیرفعال است — فقط در dev/پیش‌نمایش در دسترس است
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { success: false, error: "ورود دمو در محیط اصلی غیرفعال است" },
      { status: 403 },
    );
  }

  let id = FALLBACK_DEMO_ID;

  try {
    const { prisma } = await import("@/lib/prisma");
    // حساب دمو فقط «مشاهده» دارد (نقش demo) — نه دسترسی ادمین کامل.
    // در پنل مدیریت فقط خواندن مجاز است و هرگونه تغییری مسدود می‌شود.
    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: { role: DEMO_ROLE },
      create: { email: DEMO_EMAIL, name: DEMO_NAME, password: null, role: DEMO_ROLE },
    });
    id = user.id;
  } catch (e) {
    console.error("demo-login: database unavailable, using fallback demo user", e);
  }

  try {
    return Response.json({
      success: true,
      user: { id, name: DEMO_NAME, email: DEMO_EMAIL },
      token: signAuthToken(id),
    });
  } catch (e) {
    console.error("demo-login: token signing failed", e);
    return Response.json({ success: false, error: "AUTH_SECRET is not configured" }, { status: 500 });
  }
}
