import { prisma } from "@/lib/prisma";
import { readAuthToken } from "@/lib/auth";

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
 * Verifies the request's Bearer token and confirms the user has role "admin".
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

  if (!user || user.role !== "admin") {
    return { error: "forbidden", status: 403 };
  }

  return { user };
}
