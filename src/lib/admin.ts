import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

export const DEMO_ROLE = "demo";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

/**
 * Masks email for demo users: us***@domain.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
  return `${masked}@${domain}`;
}

/**
 * Masks Iranian phone numbers for demo users: 09*** *** ****
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 3)}*** ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return "09*** *** ****";
}

/**
 * Masks name for demo users
 */
export function maskName(_name: string): string {
  return "***";
}

/**
 * Masks address for demo users
 */
export function maskAddress(_address: string): string {
  return "***";
}

/**
 * Masks ticket subject for demo users
 */
export function maskSubject(_subject: string): string {
  return "***";
}

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

  // حساب دمو: فقط مشاهده (GET/HEAD) مجاز است؛ هر نوشتنی در پنل ادمین مسدود می‌شود
  if (user.role === DEMO_ROLE && (request.method === "GET" || request.method === "HEAD")) {
    return { user };
  }

  return { error: "forbidden", status: 403 };
}
