import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "fs";
import * as Lucide from "lucide-react";

// فقط اسامی اصلی (بدون alias های «...Icon»)
const names = Object.keys(Lucide.icons).filter((n) => !n.endsWith("Icon"));
names.sort((a, b) => a.localeCompare(b));

let out =
  '// Generated file — all Lucide icon SVG inner content (paths/shapes).\n' +
  '// Source: lucide-react registry. Name = PascalCase export (e.g. "Smartphone").\n' +
  '// Regenerate with: node generate-lucide.mjs\n' +
  "export const LUCIDE_PATHS: Record<string, string> = {\n";

for (const n of names) {
  const svg = renderToStaticMarkup(React.createElement(Lucide.icons[n]));
  const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  out += `  ${JSON.stringify(n)}: ${JSON.stringify(inner)},\n`;
}
out += "};\n";

writeFileSync("src/lib/lucide-paths.ts", out, "utf8");
console.log(`wrote ${names.length} icons -> src/lib/lucide-paths.ts`);
