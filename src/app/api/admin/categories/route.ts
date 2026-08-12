import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slugify";

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  groupId: number | null;
  parentId: number | null;
  productCount: number;
  children: CategoryNode[];
};

function buildTree(
  flat: {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    order: number;
    groupId: number | null;
    parentId: number | null;
    _count: { products: number };
  }[]
): CategoryNode[] {
  const nodeById = new Map<number, CategoryNode>();
  for (const c of flat) {
    nodeById.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      order: c.order,
      groupId: c.groupId,
      parentId: c.parentId,
      productCount: c._count.products,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const c of flat) {
    const node = nodeById.get(c.id)!;
    if (c.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeById.get(c.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.id - b.id);
    for (const n of nodes) sortRec(n.children);
  };
  sortRec(roots);

  return roots;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [categories, groups] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        order: true,
        groupId: true,
        parentId: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.menuGroup.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        icon: true,
        order: true,
        _count: { select: { categories: true } },
      },
    }),
  ]);

  return NextResponse.json({ tree: buildTree(categories), groups });
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  let slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const icon =
    typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "tag";
  const order = Number.isInteger(body.order) ? body.order : 0;
  const parentId =
    body.parentId === null || body.parentId === undefined
      ? null
      : Number(body.parentId);
  // گروه فقط برای دسته‌های ریشه معنا دارد
  const groupId =
    parentId !== null || body.groupId === null || body.groupId === undefined
      ? null
      : Number(body.groupId);

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // اسلاگ خودکار از اسم فارسی؛ دستی هم قابل تایپ است
  if (!slug) slug = slugify(name);
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug must contain only English letters, numbers and dashes" },
      { status: 400 }
    );
  }
  if (parentId !== null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: "invalid parentId" }, { status: 400 });
  }
  if (groupId !== null && !Number.isInteger(groupId)) {
    return NextResponse.json({ error: "invalid groupId" }, { status: 400 });
  }

  if (parentId !== null) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "parent category not found" }, { status: 400 });
    }
  }
  if (groupId !== null) {
    const group = await prisma.menuGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: "menu group not found" }, { status: 400 });
    }
  }

  const existingName = await prisma.category.findFirst({
    where: { name, parentId },
  });
  if (existingName) {
    return NextResponse.json(
      { error: "a category with this name already exists in this parent" },
      { status: 409 }
    );
  }
  const existingSlug = await prisma.category.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "a category with this slug already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, slug, parentId, groupId, icon, order },
  });

  return NextResponse.json({ category });
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

  const categoryId = Number(body.categoryId);
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "invalid categoryId" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }

  const data: {
    name?: string;
    slug?: string;
    parentId?: number | null;
    groupId?: number | null;
    icon?: string;
    order?: number;
  } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    const existingName = await prisma.category.findFirst({
      where: { name, parentId: category.parentId, NOT: { id: categoryId } },
    });
    if (existingName) {
      return NextResponse.json(
        { error: "a category with this name already exists in this parent" },
        { status: 409 }
      );
    }
    data.name = name;
  }

  if (body.slug !== undefined) {
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "slug must contain only English letters, numbers and dashes" },
        { status: 400 }
      );
    }
    const existingSlug = await prisma.category.findFirst({
      where: { slug, NOT: { id: categoryId } },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "a category with this slug already exists" },
        { status: 409 }
      );
    }
    data.slug = slug;
  }

  if (body.icon !== undefined) {
    data.icon =
      typeof body.icon === "string" && body.icon.trim()
        ? body.icon.trim()
        : "tag";
  }

  if (body.order !== undefined) {
    if (!Number.isInteger(body.order)) {
      return NextResponse.json({ error: "invalid order" }, { status: 400 });
    }
    data.order = body.order;
  }

  if (body.parentId !== undefined) {
    const newParentId = body.parentId === null ? null : Number(body.parentId);
    if (newParentId !== null && !Number.isInteger(newParentId)) {
      return NextResponse.json({ error: "invalid parentId" }, { status: 400 });
    }

    if (newParentId === categoryId) {
      return NextResponse.json(
        { error: "a category cannot be its own parent" },
        { status: 400 }
      );
    }

    if (newParentId !== null) {
      const newParent = await prisma.category.findUnique({ where: { id: newParentId } });
      if (!newParent) {
        return NextResponse.json({ error: "parent category not found" }, { status: 400 });
      }

      // جلوگیری از حلقه
      const all = await prisma.category.findMany({
        select: { id: true, parentId: true },
      });
      const descendantIds = new Set<number>();
      let frontier = [categoryId];
      while (frontier.length > 0) {
        const next: number[] = [];
        for (const c of all) {
          if (c.parentId !== null && frontier.includes(c.parentId)) {
            descendantIds.add(c.id);
            next.push(c.id);
          }
        }
        frontier = next;
      }
      if (descendantIds.has(newParentId)) {
        return NextResponse.json(
          { error: "cannot move a category under its own descendant" },
          { status: 400 }
        );
      }
    }

    data.parentId = newParentId;
    // دسته‌ی غیرریشه دیگر عضو گروه نیست
    if (newParentId !== null) data.groupId = null;
  }

  if (body.groupId !== undefined && category.parentId === null) {
    const newGroupId = body.groupId === null ? null : Number(body.groupId);
    if (newGroupId !== null && !Number.isInteger(newGroupId)) {
      return NextResponse.json({ error: "invalid groupId" }, { status: 400 });
    }
    if (newGroupId !== null) {
      const group = await prisma.menuGroup.findUnique({ where: { id: newGroupId } });
      if (!group) {
        return NextResponse.json({ error: "menu group not found" }, { status: 400 });
      }
    }
    data.groupId = newGroupId;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const updated = await prisma.category.update({ where: { id: categoryId }, data });

  return NextResponse.json({ category: updated });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = Number(searchParams.get("categoryId"));
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "invalid categoryId" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });
  if (!category) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }
  if (category._count.products > 0) {
    return NextResponse.json(
      { error: "این دسته‌بندی محصول دارد و قابل حذف نیست" },
      { status: 409 }
    );
  }
  if (category._count.children > 0) {
    return NextResponse.json(
      { error: "این دسته‌بندی زیردسته دارد؛ ابتدا زیردسته‌ها را حذف کنید" },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return NextResponse.json({ ok: true });
}
