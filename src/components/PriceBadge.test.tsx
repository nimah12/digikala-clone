import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PriceBadge from "./PriceBadge";

describe("PriceBadge", () => {
  it("renders only price when there is no discount", () => {
    render(<PriceBadge price={3500000} discountPercent={0} />);
    expect(screen.getByText("۳٬۵۰۰٬۰۰۰")).toBeInTheDocument();
    expect(screen.getByText("تومان")).toBeInTheDocument();
  });

  it("renders discount badge and strikethrough original price", () => {
    render(<PriceBadge price={32000000} discountPercent={18} />);
    expect(screen.getByText("٪۱۸")).toBeInTheDocument();
    // قیمت اصلی = 32M / 0.82 ≈ 39,024,390
    expect(screen.getByText("۳۹٬۰۲۴٬۳۹۰")).toBeInTheDocument();
    expect(screen.getByText("۳۲٬۰۰۰٬۰۰۰")).toBeInTheDocument();
  });
});