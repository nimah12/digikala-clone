import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";
import { signAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    if (!user) {
      return Response.json({ success: false, error: "کاربری با این اطلاعات پیدا نشد" }, { status: 404 });
    }

    // چک رمز عبور
    if (!user.password) {
      return Response.json({ success: false, error: "رمز عبور اشتباه است" }, { status: 401 });
    }
    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return Response.json({ success: false, error: "رمز عبور اشتباه است" }, { status: 401 });
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