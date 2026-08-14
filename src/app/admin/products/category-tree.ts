import type { CategoryOption, TreeCategory } from "./types";

export function flattenCategoryTree(
  nodes: TreeCategory[],
  depth = 0,
): CategoryOption[] {
  let out: CategoryOption[] = [];
  for (const n of nodes) {
    out.push({
      value: n.slug,
      label: `${"— ".repeat(depth)}${n.name} (${n.effectiveCount.toLocaleString(
        "fa-IR",
      )})`,
    });
    out = out.concat(flattenCategoryTree(n.children, depth + 1));
  }
  return out;
}

export function findTreeCategory(
  nodes: TreeCategory[],
  slug: string,
): TreeCategory | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const found = findTreeCategory(n.children, slug);
    if (found) return found;
  }
  return null;
}
