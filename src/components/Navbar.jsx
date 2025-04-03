"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import { Loader2, UserCircle2 } from "lucide-react";

function Navbar() {
  const { data: session, status } = useSession();
  const owner = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false);
  const [isNavigatingToCoupons, setIsNavigatingToCoupons] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Reset navigation states when pathname changes
  useEffect(() => {
    if (pathname.includes("/update-profile")) {
      setIsNavigatingToProfile(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.includes("/manage-coupons")) {
      setIsNavigatingToCoupons(false);
    }
  }, [pathname]);

  // Show loading screen while checking authentication, signing out, or navigating to profile
  // if (status === "loading" || isSigningOut || isNavigatingToProfile || isNavigatingToCoupons) {
  //   return <LoadingScreen />;
  // }

  const handleNavigation = (route) => {
    router.push(route);
  };

  const onManageProfile = () => {
    setIsNavigatingToProfile(true);
    router.push(`/user/${owner?.username}/update-profile`);
  };

  const onManageCoupons = () => {
    setIsNavigatingToCoupons(true);
    router.push(`/user/${owner?.username}/manage-coupons`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  const handleGetStarted = () => {
    setIsNavigatingToSignIn(true);
    router.push("/sign-in");
  };

  return (
    <nav className="p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <motion.button
          onClick={() => {
            if (owner) {
              handleNavigation(`/user/${owner?.username}`);
            } else {
              handleNavigation("/");
            }
          }}
          className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          InvisiFeed
        </motion.button>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {owner ? (
            <>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#dashboard`);
                  document
                    .getElementById("dashboard")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}` &&
                  window.location.hash === "#dashboard"
                    ? "font-bold text-yellow-400"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#generate`);
                  document
                    .getElementById("generate")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}` &&
                  window.location.hash === "#generate"
                    ? "font-bold text-yellow-400"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#ratings`);
                  document
                    .getElementById("ratings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}` &&
                  window.location.hash === "#ratings"
                    ? "font-bold text-yellow-400"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ratings
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#feedbacks`);
                  document
                    .getElementById("feedbacks")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}` &&
                  window.location.hash === "#feedbacks"
                    ? "font-bold text-yellow-400"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Feedbacks
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(`/user/${owner?.username}#contact`);
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}` &&
                  window.location.hash === "#contact"
                    ? "font-bold text-yellow-400"
                    : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`text-gray-300 hover:text-yellow-400 transition-colors ${
                  pathname === "/" ? "font-bold text-yellow-400" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="#about"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contact
              </Link>
            </>
          )}
        </div>

        {/* Login Button */}
        {!owner ? (
          <Button
            onClick={handleGetStarted}
            disabled={isNavigatingToSignIn}
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]"
          >
            {isNavigatingToSignIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        ) : (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
                  <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                    <UserCircle2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10"
                align="end"
                sideOffset={5}
              >
                <div className="px-2 py-1.5 border-b border-yellow-400/10">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 border border-yellow-400/30">
                      <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                        <UserCircle2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-yellow-400">
                        {owner?.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {owner?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={onManageProfile}
                  disabled={isNavigatingToProfile}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Manage Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={onManageCoupons}
                  disabled={isNavigatingToCoupons}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Manage Coupons
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={handleSignOut}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
