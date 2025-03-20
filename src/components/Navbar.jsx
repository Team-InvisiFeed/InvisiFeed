"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function Navbar() {
  const { data: session } = useSession();
  const owner = session?.user;

  return (
    <nav className="p-4 md:p-6 bg-white text-gray-800 shadow-lg border-b-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <a href="#home" className="text-2xl font-bold">
          InvisiFeed
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <a href="#home" className="text-gray-800 hover:text-gray-600">
            Home
          </a>
          <a href="#about" className="text-gray-800 hover:text-gray-600">
            AboutUs
          </a>
          <a href="#businesses" className="text-gray-800 hover:text-gray-600">
            Businesses
          </a>
          <a href="#contact" className="text-gray-800 hover:text-gray-600">
            ContactUs
          </a>
        </div>

        {/* Login Button */}
        {!owner ? (
          <Link href={"/register"}>
            <Button className="bg-gray-800 text-white hover:bg-gray-700">
              Register
            </Button>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-sm md:text-base">
              Welcome, {owner?.username || owner?.email}
            </span>
            <Button
              className="bg-gray-800 text-white hover:bg-gray-700"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
