import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

export const DEMO_ROLE = "demo";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

type AdminCheckResult =
  | { user: AdminUser }
  | { error: "unauthorized"; status: 401 }
  | { error: "forbidden"; status: 403 };

/**
 * Verifies the request's Bearer token and confirms the user has access.
 * - role "admin": full access (read + write).
 * - role "demo": read-only — allowed for safe methods (GET/HEAD) so the demo
 *   account can view the admin panel, but every mutation (POST/PATCH/PUT/DELETE)
 *   is rejected so it cannot create or change any data.
 * Use at the top of any admin-only API route.
 */
export async function requireAdmin(request: Request): Promise<AdminCheckResult> {
  const uid = readAuthToken(request);
  if (!uid) {
    return { error: "unauthorized", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return { error: "unauthorized", status: 401 };
  }

  if (user.role === "admin") {
    return { user };
  }

  // حساب دمو: فقط مشاهده (GET/HEAD) مجاز است
  if (user.role === DEMO_ROLE && (request.method === "GET" || request.method === "HEAD")) {
    return { user };
  }

  return { error: "forbidden", status: 403 };
}

/** خواندن کاربر احراز‌هویت‌شده (همراه نقش) یا null */
export async function readRequestUser(request: Request): Promise<AdminUser | null> {
  const uid = readAuthToken(request);
  if (!uid) return null;
  return prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, role: true },
  });
}

/**
 * اگر کاربر وارد‌شده حساب دمو باشد، یک پاسخ ۴۰۳ برمی‌گرداند تا از ایجاد تغییر
 * جلوگیری شود؛ در غیر این صورت null. در endpointهای عمومیِ نوشتن (سفارش، نظر،
 * تیکت) دقیقاً قبل از ایجاد رکورد صدا زده شود.
 */
export async function blockIfDemo(request: Request): Promise<Response | null> {
  const user = await readRequestUser(request);
  if (user && user.role === DEMO_ROLE) {
    return Response.json(
      {
        success: false,
        error: "حساب دمو فقط قابلیت مشاهده دارد و نمی‌تواند تغییری ایجاد کند.",
      },
      { status: 403 },
    );
  }
  return null;
}
