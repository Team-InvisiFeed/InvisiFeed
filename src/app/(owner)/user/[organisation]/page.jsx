"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import GenerateInvoiceQR from "./components/GenerateInvoiceQR";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import UserRatingsGraph from "./components/UserRatingsGraph";
import LoadingScreen from "@/components/LoadingScreen";
import CustomerFeedbacks from "./components/CustomerFeedbacks";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
  const { data: session, status } = useSession();
  const owner = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (!owner && status === "authenticated")
    ) {
      router.push("/sign-in");
    }
  }, [router, owner, status]);

  // Handle hash changes and initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Handle initial load
    handleHashChange();

    // Handle hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Show loading screen while checking authentication
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // Don't render anything if not authenticated
  if (!owner) {
    return null;
  }

  return (
    <>
      <div id="generate">
        <GenerateInvoiceQR />
      </div>
      <div id="dashboard">
        <Dashboard />
      </div>

      <div id="ratings">
        <UserRatingsGraph />
      </div>
      <div id="feedbacks">
        <CustomerFeedbacks />
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-white/10 backdrop-blur-md text-yellow-400 border border-yellow-400 rounded-full shadow-lg hover:bg-yellow-200/20 transition-colors duration-300 z-50 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Page;
