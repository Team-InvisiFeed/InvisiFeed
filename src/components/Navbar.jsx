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

function Navbar() {
  const { data: session } = useSession();
  const owner = session?.user;

  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (route) => {
    router.push(route); // Redirect to the provided route
  };

  const onManageProfile = () => {};

  return (
    <nav className="p-4 md:p-6 bg-white text-gray-800 shadow-lg border-b-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <a href="#home" className="text-2xl font-bold">
          InvisiFeed
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {owner ? (
            <>
              {pathname === "/" ? (
                <button
                  onClick={() => handleNavigation(`/user/${owner?.username}`)}
                  className="text-gray-800 hover:text-gray-600 cursor-pointer"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-gray-800 hover:text-gray-600 cursor-pointer"
                >
                  Home
                </button>
              )}
            </>
          ) : (
            <Link
              href="/"
              className={`text-gray-800 hover:text-gray-600 ${
                pathname === "/" ? "font-bold text-blue-600" : ""
              }`}
            >
              Home
            </Link>
          )}
          <Link href="#about" className="text-gray-800 hover:text-gray-600">
            AboutUs
          </Link>
          <Link
            href="#businesses"
            className="text-gray-800 hover:text-gray-600"
          >
            Businesses
          </Link>
          <Link href="#contact" className="text-gray-800 hover:text-gray-600">
            ContactUs
          </Link>
        </div>

        {/* Login Button */}
        {!owner ? (
          <Link href={"/sign-in"}>
            <Button className="bg-gray-800 text-white hover:bg-gray-700">
              Login
            </Button>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-sm md:text-base">
              Welcome, {owner?.username || owner?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>username</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 text-white">
                <DropdownMenuItem>Hi, {owner?.username}</DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-gray-700 cursor-pointer"
                  // onClick={onManageProfile}
                >
                  Manage Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={signOut}
                >
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
