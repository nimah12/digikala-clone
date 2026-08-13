import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleBotMessage } from "@/lib/support-bot";
import type { BotContext } from "@/lib/support-bot";

type StoredMessage = { from: "user" | "bot"; text: string; at: string };

const MAX_HISTORY = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";

    if (!message.trim()) {
      return Response.json({ success: false, error: "پیام خالی است" }, { status: 400 });
    }

    // ۱) بارگذاری یا ساخت جلسه
    const session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    const sid = session?.id ?? crypto.randomUUID();
    const storedMessages: StoredMessage[] = (session?.messages as StoredMessage[]) ?? [];
    const context: BotContext = (session?.context as BotContext) ?? {};

    // ۲) اجرای ربات با کانتکست جلسه
    const { response, context: nextContext } = await handleBotMessage(message, context);

    // ۳) ذخیره تاریخچه + کانتکست جدید
    const now = new Date().toISOString();
    const updatedMessages = [...storedMessages, { from: "user" as const, text: message, at: now }];

    if (response.text) {
      updatedMessages.push({ from: "bot" as const, text: response.text, at: new Date().toISOString() });
    }
    const trimmed = updatedMessages.slice(-MAX_HISTORY);

    await prisma.chatSession.upsert({
      where: { id: sid },
      create: { id: sid, messages: trimmed, context: nextContext },
      update: { messages: trimmed, context: nextContext },
    });

    return Response.json({ success: true, sessionId: sid, ...response });
  } catch (err) {
    console.error("[chat]", err);
    return Response.json(
      { success: false, error: "خطای سرور", text: "یک لحظه صبر کن، دوباره تلاش می‌کنم..." },
      { status: 200 },
    );
  }
}

// بازگرداندن تاریخچه یک جلسه (برای بازیابی گفتگو هنگام باز شدن دوباره چت)
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ success: true, messages: [] });
  }
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  return Response.json({
    success: true,
    messages: (session?.messages as StoredMessage[]) ?? [],
  });
}
