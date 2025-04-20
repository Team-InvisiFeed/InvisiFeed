"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UserNav from "./UserNav";

function Navbar() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [isMobile, setIsMobile] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <nav className="p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <div
          onClick={() => handleNavigation("/")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span className="text-2xl font-bold text-yellow-400 cursor-pointer">
            InvisiFeed
          </span>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-6 absolute left-1/2 -translate-x-1/2">
          {pathname === "/" || pathname === "/why-invisifeed" || pathname === "/guide" ? (
            <>
              <Link
                href="/"
                className={`text-gray-300 hover:text-yellow-400 transition-colors 
                }`}
              >
                Home
              </Link>
              <Link
                href="/why-invisifeed"
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
              <Link
                href="/guide"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Guide
              </Link>
            </>
          ) : owner ? (
            <>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#dashboard`);
                  document
                    .getElementById("dashboard")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
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
                  pathname === `/user/${owner?.username}`
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
                  pathname === `/user/${owner?.username}`
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
                  pathname === `/user/${owner?.username}`
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
                  pathname === `/user/${owner?.username}`
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

        {/* UserNav for both mobile and desktop */}
        <UserNav isMobile={isMobile} />
      </div>
    </nav>
  );
}

export default Navbar;
