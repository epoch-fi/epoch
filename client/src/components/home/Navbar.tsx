"use client";
import React, { useState } from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useUser, UserButton, useAuth } from "@clerk/nextjs";
import Spinner from "@/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/lib/homeNavigation";

interface Props {}

const Navbar = (props: Props) => {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Clerk authentication hooks
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, top: -100 }}
      animate={{ opacity: 1, top: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed left-0 top-0 z-[1000] w-full bg-transparent px-5 py-6 md:px-16"
    >
      <nav className="glassmorphism flex items-center justify-between overflow-hidden rounded-full border-[1px] border-[#292a2a] px-2 py-1 pl-4 md:px-4 ">
        {/* Logo */}
        <div className="-ml-2 flex w-fit overflow-hidden md:w-[120px]">
          <Link href="/" className="">
            <Image
              height={100}
              width={200}
              src="/brand.png"
              alt="Epoch"
              priority={true}
              className="h-fit w-20 md:w-[120px]"
            />
          </Link>
        </div>

        {/* User Authentication Options */}
        <div className="w-[120px]">
          {isLoaded ? (
            isSignedIn ? (
              <div className=" flex justify-end ">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex justify-end">
                <SignInButton>
                  <span className=" transition-200 cursor-pointer rounded-full  px-7 py-4 text-base font-[500] text-primaryText hover:scale-[1.02] hover:text-white ">
                    Sign In
                  </span>
                </SignInButton>
              </div>
            )
          ) : (
            <div className="flex items-center justify-end">
              <span className="mr-6 mt-2">
                <Spinner />
              </span>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
