import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} alt={props.alt} />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => vi.clearAllMocks());

import { render, screen } from "@testing-library/react";
import ProductCard from "./ProductCard";

const product = {
  id: 1,
  name: "گویل پیکسل ۸",
  slug: "google-pixel-8",
  description: null,
  price: 32000000,
  stock: 10,
  imageUrl: "/images/google-pixel.jpg",
  createdAt: new Date(),
  discountPercent: 18,
  rating: 4.5,
  ratingCount: 342,
  salesCount: 87,
  categoryId: 1,
  category: { id: 1, name: "موبایل", slug: "mobile" },
} as Parameters<typeof ProductCard>[0]["product"];

describe("ProductCard", () => {
  it("links to the product detail page", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/product/google-pixel-8");
  });

  it("renders product name and sales count", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText("گویل پیکسل ۸")).toBeInTheDocument();
    expect(screen.getByText("۸۷ فروش")).toBeInTheDocument();
  });

  it("renders image with product name as alt", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByAltText("گویل پیکسل ۸")).toBeInTheDocument();
  });
});