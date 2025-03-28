"use client";
import React from "react";
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

function Navbar() {
  const { data: session } = useSession();
  const owner = session?.user;

  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (route) => {
    router.push(route);
  };

  const onManageProfile = () => {
    router.push(`/user/${owner?.username}/update-profile`);
  };

  return (
    <nav className="p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <motion.a
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          InvisiFeed
        </motion.a>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {owner ? (
            <>
              {pathname === "/" ? (
                <motion.button
                  onClick={() => handleNavigation(`/user/${owner?.username}`)}
                  className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => handleNavigation("/")}
                  className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Home
                </motion.button>
              )}
            </>
          ) : (
            <Link
              href="/"
              className={`text-gray-300 hover:text-yellow-400 transition-colors ${
                pathname === "/" ? "font-bold text-yellow-400" : ""
              }`}
            >
              Home
            </Link>
          )}
          <Link
            href="#about"
            className="text-gray-300 hover:text-yellow-400 transition-colors"
          >
            AboutUs
          </Link>
          {owner ? (
            <motion.button
              onClick={() =>
                handleNavigation(`/user/${owner?.username}/ratings`)
              }
              className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ratings
            </motion.button>
          ) : (
            ""
          )}

          <Link
            href="#contact"
            className="text-gray-300 hover:text-yellow-400 transition-colors"
          >
            ContactUs
          </Link>
        </div>

        {/* Login Button */}
        {!owner ? (
          <Link href={"/sign-in"}>
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer">
              Get Started
            </Button>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-sm md:text-base text-gray-300">
              Welcome, {owner?.username || owner?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
                  <AvatarImage
                    src={owner?.image || "https://github.com/shadcn.png"}
                  />
                  <AvatarFallback className="bg-[#0A0A0A] text-yellow-400 font-semibold">
                    {owner?.username?.charAt(0).toUpperCase() || "U"}
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
                      <AvatarImage
                        src={owner?.image || "https://github.com/shadcn.png"}
                      />
                      <AvatarFallback className="bg-[#0A0A0A] text-yellow-400 text-sm">
                        {owner?.username?.charAt(0).toUpperCase() || "U"}
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
                  onClick={signOut}
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
