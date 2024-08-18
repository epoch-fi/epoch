import { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

interface Props {}

export const metadata: Metadata = {
  title: "Stock Analysis | Interactive Financial Charts",
  description:
    "Explore real-time stock chart analysis for your favorite stocks. Our interactive financial charts provide comprehensive insights to help you make informed investment decisions.",
  keywords: [
    "Real-Time Stock Chart Analysis",
    "Interactive Financial Charts",
    "Stock Market Analysis",
    "Live Stock Charts",
    "Technical Analysis Tools",
    "Investment Insights",
    "Stock Price Trends",
    "Charting Tools for Investors",
    "Market Data Visualization",
    "Stock Trading Analysis",
  ],
};

const page = (props: Props) => {
  return (
    <div className=" chat-scrollbar flex h-screen max-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-scroll py-10">
      <ComingSoon />
    </div>
  );
};

export default page;
