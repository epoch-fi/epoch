import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Your Financial Hub",
  description:
    "Access your account or create a new one to explore the latest in finance, stock analysis, and market insights. Your go-to platform for staying informed about the financial world.",
  keywords: [
    "Sign In",
    "Sign Up",
    "Account Access",
    "Financial Hub",
    "Finance",
    "Stock Analysis",
    "Market Insights",
    "Financial News",
    "Investment Tips",
    "Portfolio Management",
  ],
};

export default function Page() {
  return (
    <main className="flex min-h-screen w-full max-w-7xl items-center justify-center">
      <SignUp />
    </main>
  );
}
