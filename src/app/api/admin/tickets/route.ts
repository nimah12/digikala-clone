import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, maskEmail, maskName } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const isDemo = auth.user.role === "demo";
  const status = request.nextUrl.searchParams.get("status");
  const tickets = await prisma.supportTicket.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  if (isDemo) {
    return NextResponse.json({
      tickets: tickets.map((t) => ({
        ...t,
        name: maskName(t.name),
        email: maskEmail(t.email),
      })),
    });
  }

  return NextResponse.json({ tickets });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { ticketId, status, reply } = body;
    if (!ticketId) {
      return NextResponse.json({ error: "شناسه تیکت نامشخص است" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: Number(ticketId) },
      data: {
        ...(status ? { status: String(status) } : {}),
        ...(reply !== undefined ? { reply: String(reply) } : {}),
      },
    });
    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("[admin/tickets]", err);
    return NextResponse.json({ error: "خطا در به‌روزرسانی تیکت" }, { status: 500 });
  }
}
