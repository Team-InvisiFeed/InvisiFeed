"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, BarChart2, Zap, Star, MessageCircle } from "lucide-react";

function MobileNav() {
  const { data: session } = useSession();
  const owner = session?.user;
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (route) => {
    const [path, hash] = route.split("#");
    router.push(route);

    // Wait for the next tick to ensure the page has loaded
    setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 100);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-yellow-400/10 z-1000">
      <div className="flex items-center justify-around py-3 px-4">
        {pathname === "/" ? (
          <>
            <Link href="/" className="flex flex-col items-center space-y-1">
              <Home
                className={`h-6 w-6 ${
                  pathname === "/" ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400`}
              />
              <span
                className={`text-xs ${
                  pathname === "/" ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                Home
              </span>
            </Link>
            <Link
              href="/why-invisifeed"
              className="flex flex-col items-center space-y-1"
            >
              <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">About</span>
            </Link>
            <Link
              href="#contact"
              className="flex flex-col items-center space-y-1"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Contact</span>
            </Link>
          </>
        ) : owner ? (
          <>
            <motion.button
              onClick={() =>
                handleNavigation(`/user/${owner?.username}#dashboard`)
              }
              className="flex flex-col items-center space-y-1"
              whileTap={{ scale: 0.95 }}
            >
              <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Dashboard</span>
            </motion.button>
            <motion.button
              onClick={() =>
                handleNavigation(`/user/${owner?.username}#generate`)
              }
              className="flex flex-col items-center space-y-1"
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Generate</span>
            </motion.button>
            <motion.button
              onClick={() =>
                handleNavigation(`/user/${owner?.username}#ratings`)
              }
              className="flex flex-col items-center space-y-1"
              whileTap={{ scale: 0.95 }}
            >
              <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Ratings</span>
            </motion.button>
            <motion.button
              onClick={() =>
                handleNavigation(`/user/${owner?.username}#feedbacks`)
              }
              className="flex flex-col items-center space-y-1"
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Feedback</span>
            </motion.button>
          </>
        ) : (
          <>
            <Link href="/" className="flex flex-col items-center space-y-1">
              <Home
                className={`h-6 w-6 ${
                  pathname === "/" ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400`}
              />
              <span
                className={`text-xs ${
                  pathname === "/" ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                Home
              </span>
            </Link>
            <Link
              href="/why-invisifeed"
              className="flex flex-col items-center space-y-1"
            >
              <BarChart2 className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">About</span>
            </Link>
            <Link
              href="#contact"
              className="flex flex-col items-center space-y-1"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MessageCircle className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
              <span className="text-xs text-gray-300">Contact</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default MobileNav;
