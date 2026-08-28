"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RoutePageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "pageview",
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
