import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SupportChat from "@/components/SupportChat";
import { ThemeProvider } from "@/lib/theme";
import { getCartCount } from "@/lib/cart";

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
  const cartCount = await getCartCount();

  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Header initialCartCount={cartCount} />
          <main className="flex-1">{children}</main>
          <Footer />
          <SupportChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
