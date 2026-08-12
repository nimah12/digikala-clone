import { NextRequest } from "next/server";
import { handleBotMessage } from "@/lib/support-bot";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";
    if (!message.trim()) {
      return Response.json({ success: false, error: "پیام خالی است" }, { status: 400 });
    }
    const result = await handleBotMessage(message);
    return Response.json({ success: true, ...result });
  } catch {
    return Response.json(
      { success: false, error: "خطای سرور", text: "یک لحظه صبر کن، دوباره تلاش می‌کنم..." },
      { status: 200 },
    );
  }
}
