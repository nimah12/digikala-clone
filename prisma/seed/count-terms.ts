import { searchProducts } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { MEGA_MENU } from "@/lib/categories";
import fs from "node:fs";

async function main() {
  const terms = Array.from(new Set(MEGA_MENU.flatMap((s) => s.subcategories)));
  const rows: string[] = [];
  for (const term of terms) {
    const res = await searchProducts(term, 1000);
    rows.push(`${term}\t${res.length}`);
    process.stdout.write(`.`);
  }
  fs.writeFileSync("/tmp/opencode/term-counts-true.txt", rows.join("\n"));
  console.log("\ndone", rows.length);
}

main()
  .finally(() => prisma.$disconnect());
