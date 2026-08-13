import { NextResponse } from "next/server";
import { buildHeroSlides } from "@/lib/hero-slides";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slides = await buildHeroSlides();
    return NextResponse.json({ slides });
  } catch (err) {
    console.error("[api/hero]", err);
    return NextResponse.json({ slides: [] }, { status: 500 });
  }
}
