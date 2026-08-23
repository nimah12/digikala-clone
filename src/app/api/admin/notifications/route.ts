import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.adminNotification.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (body.all === true) {
    await prisma.adminNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } else {
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    await prisma.adminNotification.updateMany({
      where: { id, read: false },
      data: { read: true },
    });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.adminNotification.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
