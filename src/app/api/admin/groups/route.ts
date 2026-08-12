import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// لیست آیکون‌های مجاز برای گروه‌های مگامنو
export const GROUP_ICONS = [
  "phone",
  "laptop",
  "tablet",
  "watch",
  "coins",
  "basket",
  "shirt",
  "gamepad",
  "wrench",
  "headphones",
  "home",
  "coffee",
  "book",
  "spray",
  "gift",
  "lamp",
  "camera",
  "t-shirt",
  "shoe",
  "monitor",
  "tag",
  "box",
  "heart",
  "car",
] as const;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const groups = await prisma.menuGroup.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      icon: true,
      order: true,
      _count: { select: { categories: true } },
    },
  });

  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const icon =
    typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "tag";
  const order = Number.isInteger(body.order) ? body.order : 0;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const existing = await prisma.menuGroup.findUnique({ where: { title } });
  if (existing) {
    return NextResponse.json({ error: "a group with this title already exists" }, { status: 409 });
  }

  const group = await prisma.menuGroup.create({ data: { title, icon, order } });

  return NextResponse.json({ group });
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

  const groupId = Number(body.groupId);
  if (!Number.isInteger(groupId)) {
    return NextResponse.json({ error: "invalid groupId" }, { status: 400 });
  }

  const group = await prisma.menuGroup.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "group not found" }, { status: 404 });
  }

  const data: { title?: string; icon?: string; order?: number } = {};

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    const existing = await prisma.menuGroup.findFirst({
      where: { title, NOT: { id: groupId } },
    });
    if (existing) {
      return NextResponse.json({ error: "a group with this title already exists" }, { status: 409 });
    }
    data.title = title;
  }

  if (body.icon !== undefined) {
    data.icon =
      typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "tag";
  }

  if (body.order !== undefined) {
    if (!Number.isInteger(body.order)) {
      return NextResponse.json({ error: "invalid order" }, { status: 400 });
    }
    data.order = body.order;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await prisma.menuGroup.update({ where: { id: groupId }, data });

  return NextResponse.json({ group: updated });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const groupId = Number(searchParams.get("groupId"));
  if (!Number.isInteger(groupId)) {
    return NextResponse.json({ error: "invalid groupId" }, { status: 400 });
  }

  const group = await prisma.menuGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { categories: true } } },
  });
  if (!group) {
    return NextResponse.json({ error: "group not found" }, { status: 404 });
  }
  if (group._count.categories > 0) {
    return NextResponse.json(
      { error: "این گروه دسته دارد؛ ابتدا دسته‌هایش را به گروه دیگری منتقل یا حذف کنید" },
      { status: 409 }
    );
  }

  await prisma.menuGroup.delete({ where: { id: groupId } });

  return NextResponse.json({ ok: true });
}
