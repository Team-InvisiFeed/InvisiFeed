"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

function Navbar() {
  const session = false; // Dummy session state

  return (
    <nav className="p-4 md:p-6 bg-white text-gray-800 shadow-lg border-b-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <Link href="#" legacyBehavior>
          <a className="text-2xl font-bold">InvisiFeed</a>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" legacyBehavior>
            <a className="text-gray-800 hover:text-gray-600">Home</a>
          </Link>
          <Link href="/about" legacyBehavior>
            <a className="text-gray-800 hover:text-gray-600">AboutUs</a>
          </Link>
          <Link href="/businesses" legacyBehavior>
            <a className="text-gray-800 hover:text-gray-600">Businesses</a>
          </Link>
          <Link href="/contact" legacyBehavior>
            <a className="text-gray-800 hover:text-gray-600">ContactUs</a>
          </Link>
        </div>

        {/* Login Button */}
        {!session ? (
          <Link href={"/sign-in"}>
            <Button className="bg-gray-800 text-white hover:bg-gray-700">
              Login
            </Button>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-sm md:text-base">
              Welcome, {session?.owner?.username || session?.owner?.email}
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
