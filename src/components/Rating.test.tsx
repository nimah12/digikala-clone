import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Rating from "./Rating";

describe("Rating", () => {
  it("renders rating with Persian digits and decimal separator", () => {
    render(<Rating rating={4.7} ratingCount={342} />);
    expect(screen.getByText("۴٫۷")).toBeInTheDocument();
  });

  it("renders rating count with Persian digits in parentheses", () => {
    render(<Rating rating={3} ratingCount={1200} />);
    expect(screen.getByText("(۱٬۲۰۰)")).toBeInTheDocument();
  });
});