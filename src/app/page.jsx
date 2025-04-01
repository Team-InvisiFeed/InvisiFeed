"use client";

import React from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import GetStartedPopup from "@/components/GetStartedPopup";
const Page = () => {
  return (
    <main className="bg-[#0A0A0A]">
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
      <GetStartedPopup />
    </main>
  );
};

export default Page;
