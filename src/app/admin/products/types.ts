export type Product = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  salesCount: number;
  stock: number;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
};

export type MediaItem = {
  id: number;
  productId: number;
  url: string;
  type: string; // "image" | "video"
  order: number;
};

export type ColorItem = {
  id: number;
  productId: number;
  name: string;
  hex: string;
  stock: number;
  order: number;
};

export type SizeItem = {
  id: number;
  productId: number;
  name: string;
  stock: number;
  order: number;
};

export type VendorItem = {
  id: number;
  productId: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  price: number;
  stock: number;
};

export type ReviewItem = {
  id: number;
  productId: number;
  author: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  verified: boolean;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  discountPercent: number;
  imageUrl: string | null;
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
};

export type CategoryOption = { value: string; label: string };

export type TreeCategory = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  children: TreeCategory[];
};
