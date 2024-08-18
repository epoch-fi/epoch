"use client";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";
import { UserButton, useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import Spinner from "../Spinner";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useRef, useState } from "react";

interface Props {}

const SideBar = (props: Props) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  /**
   * Represents the state of whether the user is signed out or not.
   */
  const [isSignedOut, setIsSignedOut] = useState(false);

  /**
   * Represents the state of the sidebar expansion.
   */
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * A reference to a timeout used for hover functionality.
   */
  const hoverTimeoutRef = useRef<any>(null);

  
  /**
   * Function to handle the sign out functionality.
  */
  const router = useRouter();
  const handleSignOut = () => {
    setIsSignedOut(true);
    signOut();
    router.push("/");
  };

  /**
   * Handles the mouse enter/leave event for the sidebar.
   * Clears the hover timeout and sets the sidebar to expanded state after a delay.
   */
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsExpanded(true), 150);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsExpanded(false);
  };

  return (
    <nav
      className="transition-width bottom-0 left-0 top-0 z-50 hidden min-h-screen w-[80px] cursor-pointer flex-col bg-secondaryBg text-white duration-300 hover:w-[220px] md:fixed md:flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex w-full items-center justify-start gap-3 border-b border-primaryGray py-3 pl-4 ">
        {/* logo */}
        <Link
          href="/"
          className=" flex h-[50px] w-fit items-center pb-0.5 pl-[4px]"
        >
          {isExpanded ? (
            <Image
              height={40}
              width={100}
              src="/brand.png"
              alt="Epoch"
              priority={true}
              className=" h-[50px] w-fit"
            />
          ) : (
            <Image
              height={35}
              width={36}
              src="/logo.png"
              alt="Epoch"
              priority={true}
              className=" h-[35px] w-fit "
            />
          )}
        </Link>
      </div>

      {/* menu section */}
      <div className=" flex-1">
        <Menu isExpanded={isExpanded} />
      </div>

      {/* user profile */}
      {isSignedOut ? (
        <div className="flex h-[90px] w-full items-center justify-center pb-4">
          <Spinner />
        </div>
      ) : (
        <div className="flex w-full items-center justify-center border-t border-primaryGray py-3 text-primaryText">
          {isLoaded ? (
            <div className="flex w-full flex-col items-start justify-center gap-3 px-5">
              <div className="flex items-center justify-center gap-3 pt-2 text-primaryText">
                <UserButton afterSignOutUrl="/" />
                {isExpanded && (
                  <span className="hidden text-sm font-medium text-white sm:block">
                    {user?.fullName}
                  </span>
                )}
              </div>
              <div
                className={`transition-200 ${isExpanded ? "ml-7" : "-ml-1.5"} transition-margin rounded-lg bg-transparent hover:scale-[0.98] hover:bg-primaryGray `}
              >
                <SignOutButton signOutCallback={handleSignOut}>
                  <button className="flex w-full items-center justify-center gap-2 px-3 py-2 hover:text-white">
                    <LogOut />
                    {isExpanded && <span className="text-sm ">Logout</span>}
                  </button>
                </SignOutButton>
              </div>
            </div>
          ) : (
            <div className="flex h-[85px] w-full items-center justify-center pb-4">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default SideBar;
