import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// اعتبارسنجی رمز عبور: حداقل 6 کاراکتر، شامل یک حرف بزرگ و کاراکتر خاص
function validatePassword(password: string): string | null {
  if (password.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (!/[A-Z]/.test(password)) return "رمز عبور باید حداقل یک حرف بزرگ (A-Z) داشته باشد.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "رمز عبور باید حداقل یک کاراکتر خاص (مثل @ یا !) داشته باشد.";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name?.trim() || !password) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const passError = validatePassword(String(password));
    if (passError) {
      return Response.json({ success: false, error: passError }, { status: 400 });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Response.json({ success: false, error: "ایمیل معتبر نیست" }, { status: 400 });
      }
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return Response.json({ success: false, error: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
      }
      await prisma.user.create({
        data: { name: name.trim(), email, phone: null, password },
      });
    } else if (phone) {
      const phoneDigits = String(phone).replace(/[^\d]/g, "");
      if (!/^09\d{9}$/.test(phoneDigits)) {
        return Response.json({ success: false, error: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود" }, { status: 400 });
      }
      const exists = await prisma.user.findFirst({ where: { phone: phoneDigits } });
      if (exists) {
        return Response.json({ success: false, error: "این شماره قبلاً ثبت شده است" }, { status: 409 });
      }
      await prisma.user.create({
        data: { name: name.trim(), email: `${phoneDigits}@phone.local`, phone: phoneDigits, password },
      });
    } else {
      return Response.json({ success: false, error: "ایمیل یا شماره موبایل الزامی است" }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (e: unknown) {
    console.error("REGISTER ERROR:", e);
    const msg = e instanceof Error ? e.message : "خطای سرور";
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
