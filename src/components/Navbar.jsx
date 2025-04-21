"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UserNav from "./UserNav";
import LoadingScreen from "./LoadingScreen";

function Navbar() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
    router.push(route);
  };
  

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

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
          {pathname === "/" ||
          pathname === "/purpose" ||
          pathname === "/guide" ||
          pathname === "/privacy-policy" ||
          pathname === "/terms-of-service"  ? (
            <>
              <motion.div
                onClick={() => handleNavigation("/")}
                className={`text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Home
              </motion.div>
              <motion.div
                onClick={() => handleNavigation("/purpose")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Purpose
              </motion.div>
              <motion.div
                onClick={() => handleNavigation("/guide")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Guide
              </motion.div>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.div>
            </>
          ) : owner ? (
            <>
              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "dashboard"
                    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleNavigation(`${targetPath}#dashboard`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.div>
              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "generate"
                    document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleNavigation(`${targetPath}#generate`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate
              </motion.div>
              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "ratings"
                    document.getElementById("ratings")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleNavigation(`${targetPath}#ratings`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ratings
              </motion.div>
              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "feedbacks"
                    document
                      .getElementById("feedbacks")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleNavigation(`${targetPath}#feedbacks`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Feedbacks
              </motion.div>

              <motion.div
                onClick={(e) => {
                  e.preventDefault();

                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                onClick={() => handleNavigation("/")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Home
              </motion.div>
              <motion.div
                onClick={() => {
                  handleNavigation("/purpose");
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Purpose
              </motion.div>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.div>
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
