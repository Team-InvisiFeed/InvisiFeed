"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import ContactAdminPopup from "./ContactAdminPopup";
import { useRouter } from "next/navigation";
const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for freelancers and agencies just starting out.",
    features: [
      "Unlimited feedback collection",
      "Basic analytics dashboard",
      "Standard feedback form",
      "3 invoices per day",
      "Coupons management tools",
      "Email support access",
    ],
    cta: "Get Started Free",
    highlighted: false,
    delay: 0.1,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    description: "Designed for growing businesses and scaling agencies.",
    features: [
      "All Free plan features",
      "Advanced analytics dashboard",
      "Multiple invoice templates",
      "Custom feedback forms",
      "Unlimited invoice creation",
      "Monthly performance reports",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    delay: 0.2,
  },
];


const PricingSection = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Choose the plan that works best for your business
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: plan.delay }}
            >
              <div 
                className={`bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border rounded-xl p-8 h-full ${
                  plan.highlighted 
                    ? "border-yellow-400/30 shadow-lg shadow-yellow-400/10" 
                    : "border-yellow-400/10"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-yellow-400">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    if (plan.name === "Pro") {
                      setOpen(true);
                    } 
                    else if (plan.name === "Free") {
                      router.push("/register");
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/20"
                      : "bg-transparent border-2 border-yellow-400/20 text-yellow-400 hover:border-yellow-400/40"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Need a custom plan for your enterprise? <a href="#" className="text-yellow-400 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
    <ContactAdminPopup open={open} onOpenChange={setOpen} />
    </>
  );
};

export default PricingSection; 