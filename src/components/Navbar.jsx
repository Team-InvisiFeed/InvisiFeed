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
  };

  const handleSamePageNavigation = (route) => {
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
        <Link
          href="/"
          onClick={() => handleNavigation("/")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span className="text-2xl font-bold text-yellow-400 cursor-pointer">
            InvisiFeed
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-6 absolute left-1/2 -translate-x-1/2">
          {pathname === "/" ||
          pathname === "/pricing" ||
          pathname === "/purpose" ||
          pathname === "/guide" ||
          pathname === "/privacy-policy" ||
          pathname === "/terms-of-service" ? (
            <>
              <Link
                href={"/"}
                onClick={() => handleNavigation("/")}
                className={`text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer`}
              >
                Home
              </Link>
              <Link
                href={"/purpose"}
                onClick={() => handleNavigation("/purpose")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Purpose
              </Link>
              <Link
                href={"/guide"}
                onClick={() => handleNavigation("/guide")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Guide
              </Link>
              <Link
                href={"/pricing"}
                onClick={() => handleNavigation("/pricing")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Pricing
              </Link>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
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
                    // Smooth scroll to the element with ID "generate"
                    document
                      .getElementById("generate")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleSamePageNavigation(`${targetPath}#generate`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Generate
              </motion.div>
              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "dashboard"
                    document
                      .getElementById("dashboard")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleSamePageNavigation(`${targetPath}#dashboard`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Dashboard
              </motion.div>

              <motion.div
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const targetPath = `/user/${owner?.username}`;

                  if (currentPath === targetPath) {
                    // Smooth scroll to the element with ID "ratings"
                    document
                      .getElementById("ratings")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    // Navigate to the target page
                    handleSamePageNavigation(`${targetPath}#ratings`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
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
                    handleSamePageNavigation(`${targetPath}#feedbacks`);
                  }
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
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
              >
                Contact
              </motion.div>
            </>
          ) : (
            <>
              <Link
                href={"/"}
                onClick={() => handleNavigation("/")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Home
              </Link>
              <Link
                href={"/purpose"}
                onClick={() => handleNavigation("/purpose")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Purpose
              </Link>
              <Link
                href={"/guide"}
                onClick={() => handleNavigation("/guide")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Guide
              </Link>

              <Link
                href={"/pricing"}
                onClick={() => handleNavigation("/pricing")}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Pricing
              </Link>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
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
