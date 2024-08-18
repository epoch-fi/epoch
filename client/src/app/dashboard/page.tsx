import ChatBot from "@/components/chat-bot/OldChatBot";
import { Metadata } from "next";

interface Props {}

export const metadata: Metadata = {
  title: "Financial Chatbot | Ask Anything About Stocks and Finance",
  description:
    "Engage with our intelligent chatbot for real-time stock analysis and financial queries. Your personal assistant in the world of finance.",
  keywords: [
    "Financial Chatbot",
    "Stock Queries",
    "Investment Advice",
    "Real-time Analysis",
    "Personal Finance Assistant",
    "Intelligent Chat Assistant",
    "Finance Q&A",
    "Market Information",
    "Stock Recommendations",
    "Financial Conversations",
  ],
};

const Page = (props: Props) => {
  return (
    <div className="relative h-screen w-full ">
      <ChatBot />
    </div>
  );
};

export default Page;
