"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import GenerateInvoiceQR from "./components/GenerateInvoiceQR";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session } = useSession();
  const owner = session?.user;

  const router = useRouter();

  useEffect(() => {
    // Simulating authentication check
    if (!owner) {
      router.push("/sign-in");
    }
  }, [router]);
  return (
    <>
      {owner && (
        <>
          <Navbar />
          <Dashboard />
          <GenerateInvoiceQR />
          <Footer />
        </>
      )}
    </>
  );
};

export default Page;
