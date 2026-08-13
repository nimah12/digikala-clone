import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";
import { sendEmail, emailLayout } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return Response.json(
        { success: false, error: "لطفاً همه فیلدها را کامل کنید." },
        { status: 400 },
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email).trim())) {
      return Response.json(
        { success: false, error: "ایمیل واردشده معتبر نیست." },
        { status: 400 },
      );
    }

    const userId = readAuthToken(request) ?? null;

    const ticket = await prisma.supportTicket.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        subject: String(subject).trim(),
        message: String(message).trim(),
        userId,
      },
    });

    // ایمیل اطلاع‌رسانی به ادمین
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      (
        await prisma.user.findFirst({
          where: { role: "admin" },
          select: { email: true },
        })
      )?.email;

    if (adminEmail) {
      const html = emailLayout(
        "تیکت جدید پشتیبانی",
        `<p>یک تیکت جدید در سیستم پشتیبانی ثبت شده است:</p>
         <table style="width:100%;border-collapse:collapse;font-size:13px">
           <tr><td style="padding:6px 8px;background:#f5f5f5;font-weight:bold;width:90px">شماره تیکت</td><td style="padding:6px 8px">#${ticket.id}</td></tr>
           <tr><td style="padding:6px 8px;background:#f5f5f5;font-weight:bold">فرستنده</td><td style="padding:6px 8px">${ticket.name} (${ticket.email})</td></tr>
           <tr><td style="padding:6px 8px;background:#f5f5f5;font-weight:bold">موضوع</td><td style="padding:6px 8px">${ticket.subject}</td></tr>
           <tr><td style="padding:6px 8px;background:#f5f5f5;font-weight:bold">متن</td><td style="padding:6px 8px">${ticket.message}</td></tr>
         </table>
         <p style="text-align:center;margin:20px 0">
           <a href="${request.nextUrl.origin}/admin/tickets" style="display:inline-block;background:#ef4050;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:12px;font-weight:bold">مشاهده تیکت‌ها در پنل</a>
         </p>`,
      );
      await sendEmail({
        to: adminEmail,
        subject: `تیکت جدید #${ticket.id} — ${ticket.subject}`,
        html,
      });
    }

    return Response.json({ success: true, id: ticket.id });
  } catch (err) {
    console.error("[support/tickets]", err);
    return Response.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
