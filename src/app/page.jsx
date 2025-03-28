"use client";

import React, { useCallback, useState } from "react";

import HeroSection from "@/components/HeroSection";

const Page = () => {
  // Dummy data for the carousel messages

  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <HeroSection />
    </>
  );
};

export default Page;
