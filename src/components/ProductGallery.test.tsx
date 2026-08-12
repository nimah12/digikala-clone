import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} alt={props.alt} />
  ),
}));

import ProductGallery from "./ProductGallery";

const media = [
  { id: 1, url: "/images/p1.jpg", type: "image" },
  { id: 2, url: "/images/p2.jpg", type: "image" },
  { id: 3, url: "/images/p3.jpg", type: "image" },
];

function renderGallery() {
  return render(
    <ProductGallery mainImageUrl="/images/main.jpg" media={media} productName="محصول تست" />
  );
}

beforeEach(() => vi.clearAllMocks());

describe("ProductGallery lightbox", () => {
  it("renders the main image", () => {
    renderGallery();
    expect(screen.getByAltText("محصول تست")).toBeInTheDocument();
  });

  it("opens a fullscreen lightbox when clicking the main image", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the lightbox at the clicked thumbnail index", () => {
    renderGallery();
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(screen.getByText("۲ / ۴")).toBeInTheDocument();
  });

  it("shows the item counter", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    expect(screen.getByText("۱ / ۴")).toBeInTheDocument();
  });

  it("navigates to the next image", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    fireEvent.click(screen.getByLabelText("تصویر بعدی"));
    expect(screen.getByText("۲ / ۴")).toBeInTheDocument();
  });

  it("wraps around when navigating backwards", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    fireEvent.click(screen.getByLabelText("تصویر قبلی"));
    expect(screen.getByText("۴ / ۴")).toBeInTheDocument();
  });

  it("closes the lightbox", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("zooms in and out with the control buttons", () => {
    renderGallery();
    fireEvent.click(screen.getByAltText("محصول تست"));
    expect(screen.getByText("٪۱۰۰")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("بزرگ‌نمایی"));
    expect(screen.getByText("٪۱۵۰")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("کوچک‌نمایی"));
    expect(screen.getByText("٪۱۰۰")).toBeInTheDocument();
  });
});
