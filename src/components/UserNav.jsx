"use client";
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, UserCircle2 } from "lucide-react";

function UserNav({ isMobile = false }) {
  const { data: session } = useSession();
  const owner = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false);
  const [isNavigatingToCoupons, setIsNavigatingToCoupons] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const router = useRouter();

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

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  if (!owner) {
    return (
      <Button
        onClick={handleGetStarted}
        disabled={isNavigatingToSignIn}
        className={`${
          isMobile ? "" : "hidden md:flex"
        } bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]`}
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
    );
  }

  if (isMobile) {
    return (
      <div className="flex items-center space-x-4">
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="focus:outline-none"
          >
            <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
              <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                <UserCircle2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10 z-50">
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
              <button
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                onClick={() => {
                  onManageProfile();
                  setIsProfileDropdownOpen(false);
                }}
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
              </button>
              <button
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                onClick={() => {
                  onManageCoupons();
                  setIsProfileDropdownOpen(false);
                }}
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
              </button>
              <button
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                onClick={() => {
                  handleSignOut();
                  setIsProfileDropdownOpen(false);
                }}
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
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
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
                <span className="text-xs text-gray-400">{owner?.email}</span>
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
            onClick={onManageCoupons}
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
  );
}

export default UserNav;
