"use client";
import Image from "next/image";
import Link from "next/link";
import chatbot from "@/assets/chatbot.png";
import dot from "@/assets/dot.png";
import { motion } from "framer-motion";

interface Props {}

const HeroSection = (props: Props) => {
  return (
    <section id="home" className="h-full w-full bg-black">
      <div className="relative ">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full bg-gradient-to-t from-transparent via-[#040c1e] to-[#0d1424] pt-[140px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className=" relative flex h-full w-full flex-col items-center justify-center bg-transparent px-4 py-10 "
            >
              <div className="z-100 relative flex items-center justify-center">
                <span className="glassmorphism mb-2 rounded-lg px-5 py-1 text-xs uppercase">
                  <ul>
                    <li className="list-disc font-mono text-sm font-extrabold tracking-wide text-indigo-600 ">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        coming in beta
                      </span>
                    </li>
                  </ul>
                </span>
              </div>
              <div className="w-full text-center sm:max-w-2xl md:max-w-4xl">
                <div className="relative w-full">
                  <h1 className="transition-300 relative text-3xl font-bold text-white md:text-5xl">
                    Elevate Your Investing Strategies
                  </h1>
                  <div className="relative -ml-[110px] mt-2 h-2 max-w-4xl overflow-hidden sm:-ml-16 md:-ml-2">
                    {/* Gradients */}
                    <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-purple-600 to-transparent blur-sm" />
                    <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    <div className="absolute inset-x-[160px] top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
                    <div className="absolute inset-x-[160px] top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />
                  </div>
                </div>

                <p className="mx-auto mt-5 text-base text-secondaryText sm:text-lg">
                Harness the power of Artificial Intelligence to distill insights from 
                fundamental data, tap into expert wisdom, and stay ahead with real-time market intelligence.
                </p>
              </div>
              <Link
                href="/dashboard"
                className=" transition-300 glassmorphism mt-8 cursor-pointer rounded-full border-[1px] border-[#292a2a] px-6 py-3 text-base font-[500] text-primaryText hover:scale-[0.98] hover:border-gray-500 hover:text-white hover:shadow-[0_0_80px_-15px_rgba(188,188,209,0.6)]"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden px-8 py-10"
          >
            <div className="relative">
              <Image
                src={dot}
                alt="dot"
                width={100}
                height={100}
                priority={true}
                className="absolute -right-6 -top-5 h-[100px] w-[100px] rounded-lg object-contain"
                placeholder="blur"
              />
              <Image
                src={chatbot}
                alt="chatbot"
                width={700}
                height={700}
                priority={true}
                className="relative z-20 h-full w-[1000px] rounded-lg object-contain"
                placeholder="blur"
              />
              <Image
                src={dot}
                alt="dot"
                width={100}
                height={100}
                priority={true}
                className="absolute -bottom-5 -left-6 h-[100px] w-[100px] rounded-lg object-contain "
                placeholder="blur"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
