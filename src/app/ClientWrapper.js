"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  const { status } = useSession();

  // Check if the route matches specific paths
  const isPageWithoutNavbarAndFooter =
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/forgot-password?") ||
    pathname.includes("/complete-profile");

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <>
      {!isPageWithoutNavbarAndFooter && <Navbar />}
      <main>{children || <p>No children to render</p>}</main>
      {!isPageWithoutNavbarAndFooter && <Footer />}
      {!isPageWithoutNavbarAndFooter && <MobileNav />}
    </>
  );
}
