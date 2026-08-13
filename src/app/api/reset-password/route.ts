import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { verifyResetToken } from "@/lib/reset-token";

function validatePassword(password: string): string | null {
  if (password.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (!/[A-Z]/.test(password)) return "رمز عبور باید حداقل یک حرف بزرگ (A-Z) داشته باشد.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "رمز عبور باید حداقل یک علامت (!@#$...) داشته باشد.";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const payload = verifyResetToken(String(token));
    if (!payload) {
      return Response.json(
        { success: false, error: "لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید." },
        { status: 400 },
      );
    }

    const passError = validatePassword(String(password));
    if (passError) {
      return Response.json({ success: false, error: passError }, { status: 400 });
    }

    // فقط کاربرِ همان ایمیل می‌تواند رمز خود را تغییر دهد
    const user = await prisma.user.findUnique({ where: { id: payload.uid } });
    if (!user || user.email !== payload.email) {
      return Response.json(
        { success: false, error: "حساب کاربری یافت نشد." },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(String(password)) },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
