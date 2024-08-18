"use client";
import { useUser, UserButton, useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Separator } from "../ui/separator";
import Image from "next/image";
import Link from "next/link";
import Spinner from "../Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Navigation } from "@/lib/dashboardNavigation";

interface Props {}

const TopBar = (props: Props) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, top: -60 }}
      animate={{ opacity: 1, top: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed left-0 top-0 z-50 w-full bg-primaryBg md:hidden"
    >
      <nav className="flex items-center justify-between px-4 py-3 ">
        {/* Logo */}
        <div className="flex w-fit ">
          <Link href="/">
            <Image
              height={40}
              width={100}
              src="/brand.png"
              alt="Epoch"
              priority={true}
              className=" h-[50px] w-fit"
            />
          </Link>
        </div>

        {/* Small Screen Navigation and Menu Button */}
        <div className="flex items-center gap-4 ">
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
          <div className="glassmorphism relative flex gap-3 rounded-full md:hidden">
            <button
              type="button"
              className=" flex items-center justify-center rounded-md p-2.5 text-primaryText"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Small Screen Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="modal"
              initial={{ opacity: 0, top: 30 }}
              animate={{ opacity: 1, top: 90 }}
              exit={{ opacity: 0, top: 30 }}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 top-[90px] w-[80%] -translate-x-1/2 transform overflow-hidden rounded-2xl md:hidden"
            >
              <div className="glassmorphism flex w-full flex-col items-center justify-center gap-3 px-6 py-10">
                {Navigation?.map((item, i) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="transition-ease text-lg font-semibold leading-6 text-secondaryText hover:text-primaryText"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default TopBar;
