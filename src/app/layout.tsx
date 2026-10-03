import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SupportChat from "@/components/SupportChat";
import Toast from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme";
import { getMegaMenu } from "@/lib/menu-server";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/GoogleTagManager";
import { RoutePageViewTracker } from "@/components/analytics/RoutePageViewTracker";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "دیجی‌کلون | فروشگاه اینترنتی کالای دیجیتال",
    template: "%s | دیجی‌کلون",
  },
  description:
    "فروشگاه اینترنتی دیجی‌کلون — خرید موبایل، لپ‌تاپ، تبلت و ساعت هوشمند با بهترین قیمت و ضمانت اصالت کالا",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuGroups = await getMegaMenu();
  // nonce که proxy.ts برای هر درخواست می‌سازد
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("dk-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`,
          }}
        />
        <GoogleTagManager nonce={nonce} />
      </head>
      <body className="min-h-screen flex flex-col">
        <GoogleTagManagerNoScript />
        <ThemeProvider>
          <Header menuGroups={menuGroups} />
          <main className="flex-1">{children}</main>
          <Footer />
          <SupportChat />
          <Toast />
          <RoutePageViewTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
