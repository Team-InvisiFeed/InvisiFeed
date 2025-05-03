"use client";
import React, { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Home,
  BarChart2,
  Zap,
  Star,
  MessageCircle,
  Book,
  Check,
  Gem,
} from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import { MdMoney } from "react-icons/md";

function MobileNav() {
  const { data: session } = useSession();
  const owner = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // const handleNavigation = (route) => {
  //   const [path, hash] = route.split("#");
  //   router.push(route);

  //   // Wait for the next tick to ensure the page has loaded
  //   setTimeout(() => {
  //     if (hash) {
  //       const element = document.getElementById(hash);
  //       if (element) {
  //         element.scrollIntoView({ behavior: "smooth" });
  //       }
  //     }
  //   }, 100);
  // };
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

  // if (loading) {
  //   return <LoadingScreen />;
  // }
  return (
    <>
      {loading && <LoadingScreen />}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-yellow-400/10 z-1000">
        <div className="flex items-center justify-around py-3 px-4">
          {pathname === "/" ||
          pathname === "/purpose" ||
          pathname === "/guide" ||
          pathname === "/privacy-policy" ||
          pathname === "/terms-of-service" ? (
            <>
              <div
                onClick={() => handleNavigation("/")}
                className="flex flex-col items-center space-y-1"
              >
                <Home
                  className={`h-6 w-6 text-gray-300 hover:text-yellow-400`}
                />
                <span className={`text-xs text-gray-300 hover:text-yellow-400`}>
                  Home
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/purpose")}
                className="flex flex-col items-center space-y-1"
              >
                <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Purpose
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/pricing")}
                className="flex flex-col items-center space-y-1"
              >
                <Gem className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Pricing
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/guide")}
                className="flex flex-col items-center space-y-1"
              >
                <Book className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Guide
                </span>
              </div>
              <div
                className="flex flex-col items-center space-y-1"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Contact
                </span>
              </div>
            </>
          ) : owner ? (
            <>
              <motion.button
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
                    handleNavigation(`${targetPath}#generate`);
                  }
                }}
                className="flex flex-col items-center space-y-1"
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Generate
                </span>
              </motion.button>
              <motion.button
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
                    handleNavigation(`${targetPath}#dashboard`);
                  }
                }}
                className="flex flex-col items-center space-y-1"
                whileTap={{ scale: 0.95 }}
              >
                <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Dashboard
                </span>
              </motion.button>

              <motion.button
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
                    handleNavigation(`${targetPath}#ratings`);
                  }
                }}
                className="flex flex-col items-center space-y-1"
                whileTap={{ scale: 0.95 }}
              >
                <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Ratings
                </span>
              </motion.button>
              <motion.button
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
                className="flex flex-col items-center space-y-1"
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Feedback
                </span>
              </motion.button>
            </>
          ) : (
            <>
              <div
                onClick={() => handleNavigation("/")}
                className="flex flex-col items-center space-y-1"
              >
                <Home
                  className={`h-6 w-6 text-gray-300 hover:text-yellow-400`}
                />
                <span className={`text-xs text-gray-300 hover:text-yellow-400`}>
                  Home
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/purpose")}
                className="flex flex-col items-center space-y-1"
              >
                <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Purpose
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/pricing")}
                className="flex flex-col items-center space-y-1"
              >
                <Gem className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Pricing
                </span>
              </div>
              <div
                onClick={() => handleNavigation("/guide")}
                className="flex flex-col items-center space-y-1"
              >
                <Book className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Guide
                </span>
              </div>
              <div
                className="flex flex-col items-center space-y-1"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                <span className="text-xs text-gray-300 hover:text-yellow-400">
                  Contact
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileNav;
