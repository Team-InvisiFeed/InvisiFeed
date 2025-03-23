"use client";
import Navbar from "@/components/Navbar";
import React, { useCallback, useState } from "react";

import Footer from "@/components/Footer";

import HeroSection from "@/components/HeroSection";
import ShowBusinesses from "@/components/ShowBusinesses";
const Page = () => {
  // Dummy data for the carousel messages

  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <HeroSection />

      <ShowBusinesses />
    </>
  );
};

export default Page;
