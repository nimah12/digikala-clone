import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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
    if (!user) {
      return Response.json({ success: true });
    }

    // در این نسخه دمو، لینک بازیابی به‌صورت واقعی ارسال نمی‌شود.
    // در محیط واقعی اینجا باید ایمیل/SMS ارسال شود.
    console.log(`[demo] password reset requested for: ${user.email || user.phone}`);

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
