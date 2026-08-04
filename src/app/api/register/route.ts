import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name?.trim() || !password || password.length < 6) {
      return Response.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
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
        data: { name: name.trim(), email, phone: null },
      });
    } else if (phone) {
      // phone-only: store as email placeholder is not possible (email unique) — store as phone
      const exists = await prisma.user.findFirst({ where: { phone } });
      if (exists) {
        return Response.json({ success: false, error: "این شماره قبلاً ثبت شده است" }, { status: 409 });
      }
      await prisma.user.create({
        data: { name: name.trim(), email: `${phone}@phone.local`, phone },
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
