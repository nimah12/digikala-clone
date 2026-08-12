import { NextRequest } from "next/server";
import { signAuthToken } from "@/lib/auth";

const DEMO_EMAIL = "demo@digikala-clone.local";
const DEMO_NAME = "کاربر دمو";
const FALLBACK_DEMO_ID = 999999;

export async function POST(_request: NextRequest) {
  let id = FALLBACK_DEMO_ID;

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: { email: DEMO_EMAIL, name: DEMO_NAME, password: null },
    });
    id = user.id;
  } catch (e) {
    console.error("demo-login: database unavailable, using fallback demo user", e);
  }

  try {
    return Response.json({
      success: true,
      user: { id, name: DEMO_NAME, email: DEMO_EMAIL },
      token: signAuthToken(id),
    });
  } catch (e) {
    console.error("demo-login: token signing failed", e);
    return Response.json({ success: false, error: "AUTH_SECRET is not configured" }, { status: 500 });
  }
}
