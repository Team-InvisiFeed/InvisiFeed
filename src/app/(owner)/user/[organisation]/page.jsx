"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import GenerateInvoiceQR from "./components/GenerateInvoiceQR";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import UserRatingsGraph from "./components/UserRatingsGraph";
import LoadingScreen from "@/components/LoadingScreen";
import CustomerFeedbacks from "./components/CustomerFeedbacks";

const Page = () => {
  const { data: session, status } = useSession();
  const owner = session?.user;
  const router = useRouter();
  const pathname = usePathname();

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
      
    </>
  );
};

export default Page;
