import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signAuthToken } from "@/lib/auth";

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
      const createdEmail = await prisma.user.create({
        data: { name: name.trim(), email, phone: null, password: await hashPassword(String(password)) },
      });
      return Response.json({
        success: true,
        user: { id: createdEmail.id, name: createdEmail.name, email: createdEmail.email, phone: createdEmail.phone },
        token: signAuthToken(createdEmail.id),
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
      const createdPhone = await prisma.user.create({
        data: { name: name.trim(), email: `${phoneDigits}@phone.local`, phone: phoneDigits, password: await hashPassword(String(password)) },
      });
      return Response.json({
        success: true,
        user: { id: createdPhone.id, name: createdPhone.name, email: createdPhone.email, phone: createdPhone.phone },
        token: signAuthToken(createdPhone.id),
      });
    } else {
      return Response.json({ success: false, error: "ایمیل یا شماره موبایل الزامی است" }, { status: 400 });
    }
  } catch (e: unknown) {
    console.error("REGISTER ERROR:", e);
    const msg = e instanceof Error ? e.message : "خطای سرور";
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
