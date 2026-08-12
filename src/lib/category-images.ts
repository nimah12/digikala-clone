export const CATEGORY_IMAGE: Record<string, string> = {
  audio: "/images/categories/audio.svg",
  beauty: "/images/categories/beauty.svg",
  books: "/images/categories/books.svg",
  camera: "/images/categories/camera.svg",
  clothing: "/images/categories/clothing.svg",
  decor: "/images/categories/decor.svg",
  fashion: "/images/categories/fashion.svg",
  "gold-silver": "/images/categories/gold-silver.svg",
  gpu: "/images/categories/gpu.svg",
  home: "/images/categories/home.svg",
  "home-appliances": "/images/categories/home-appliances.svg",
  laptop: "/images/categories/laptop.svg",
  mobile: "/images/categories/mobile.svg",
  perfume: "/images/categories/perfume.svg",
  smartwatch: "/images/categories/smartwatch.svg",
  sports: "/images/categories/sports.svg",
  supermarket: "/images/categories/supermarket.svg",
  tablet: "/images/categories/tablet.svg",
  tools: "/images/categories/tools.svg",
  toys: "/images/categories/toys.svg",
}

export const FALLBACK_IMAGE = "/images/categories/mobile.svg"

export function categoryImageUrl(categorySlug: string | null | undefined): string {
  if (!categorySlug) return FALLBACK_IMAGE
  return CATEGORY_IMAGE[categorySlug] ?? FALLBACK_IMAGE
}
