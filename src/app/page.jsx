"use client";

import React from "react";

import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardShowcaseSection from "@/components/DashboardShowcaseSection";
import BenefitsSection from "@/components/BenefitsSection";
import SampleInvoiceSection from "@/components/SampleInvoiceSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SecuritySection from "@/components/SecuritySection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import GetStartedPopup from "@/components/GetStartedPopup";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <div className="relative">
        {/* Background gradient for the entire page */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50 z-[-1]" />

        {/* Content sections */}
        <div className="relative">
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DashboardShowcaseSection />
          <BenefitsSection />
          <SampleInvoiceSection />
          <TestimonialsSection />
          <SecuritySection />
          <FAQSection />
          <CTASection />
        </div>
      </div>
      <GetStartedPopup />
      <ScrollToTop />
    </main>
  );
}
