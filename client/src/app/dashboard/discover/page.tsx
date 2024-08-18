import React from "react";
import { Metadata } from "next";
import tech from "@/assets/tech.jpg";
import arm from "@/assets/arm_sq.jpeg";
import unemployment from "@/assets/unemployment.jpg";
import interest from "@/assets/interest.jpg";
import oil from "@/assets/oil.jpg";
import retail from "@/assets/retail.jpg";
import Card from "@/components/news/Card";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Discover Trending Insights | Stay Updated with Market Highlights",
  description:
    "Discover the latest trends in the financial world. Breaking news, market updates, and insightful analysis to keep you ahead in the stock market.",
  keywords: [
    "Financial News",
    "Market Highlights",
    "Stock Market Updates",
    "Breaking Finance News",
    "Economic Trends",
    "Investment News",
    "Market Analysis",
    "Trending Stocks",
    "Global Markets",
    "Financial Headlines",
  ],
};

interface Props {}

const page = (props: Props) => {
  return (
    <div className=" chat-scrollbar flex h-screen max-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-scroll py-10">
      <ComingSoon />
    </div>
  );
};

export default page;
