"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InactivityPopup from "@/components/InactivityPopup";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Check if the route matches specific paths
  const isFeedbackPage =
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/forgot-password")||
    pathname.startsWith("/forgot-password?");

  return (
    <>
      {!isFeedbackPage && <Navbar />}
      <main>{children || <p>No children to render</p>}</main>
      {!isFeedbackPage && <Footer />}
    </>
  );
}
