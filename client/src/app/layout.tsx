import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Financial Hub | Analyzing Stocks, Providing Insights",
  description:
    "Explore the latest in finance, stock analysis, and market insights. Your go-to platform for staying informed about the financial world.",
  keywords: [
    "Finance",
    "Stock Analysis",
    "Market Insights",
    "Financial News",
    "Investment Tips",
    "Portfolio Management",
    "Market Trends",
    "Economic Updates",
    "Financial Education",
    "Wealth Management",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "min-w-screen min-h-screen bg-gradient-to-b from-primaryBg via-primaryBg to-black text-primaryText antialiased",
        )}
      >
        <link rel="icon" href="/logo.png" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
