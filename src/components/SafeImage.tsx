"use client";

import { useState, type ComponentProps, type ImgHTMLAttributes } from "react";
import Image from "next/image";

const PLACEHOLDER_SRC = "/images/placeholder.svg";

/**
 * نسخهای از next/image که در صورت خطای لود عکس (مثلاً 403) بهصورت خودکار
 * به placeholder پیشفرض برمیگردد.
 */
export function SafeImage({
  src,
  ...props
}: Omit<ComponentProps<typeof Image>, "src" | "onError"> & {
  src?: string | null;
}) {
  const initial = src || PLACEHOLDER_SRC;
  const [imgSrc, setImgSrc] = useState(initial);
  const [prevSrc, setPrevSrc] = useState(initial);

  // اگر prop ی src عوض شد، state همراهش بروز میشود (الگوی توصیهشدهٔ React)
  if (prevSrc !== initial) {
    setPrevSrc(initial);
    setImgSrc(initial);
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER_SRC)}
    />
  );
}

/**
 * نسخهای از <img> معمولی که در صورت خطای لود عکس (مثلاً 403) بهصورت خودکار
 * به placeholder پیشفرض برمیگردد.
 */
export function SafeImg({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src?: string | null }) {
  const initial = src || PLACEHOLDER_SRC;
  const [imgSrc, setImgSrc] = useState(initial);
  const [prevSrc, setPrevSrc] = useState(initial);

  // اگر prop ی src عوض شد، state همراهش بروز میشود (الگوی توصیهشدهٔ React)
  if (prevSrc !== initial) {
    setPrevSrc(initial);
    setImgSrc(initial);
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} src={imgSrc} onError={() => setImgSrc(PLACEHOLDER_SRC)} />
  );
}