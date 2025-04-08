"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  Upload, 
  QrCode, 
  Send, 
  MessageSquare 
} from "lucide-react";

const steps = [
  {
    title: "Register your organization",
    description: "Sign in with Google or create an account to get started",
    icon: UserPlus,
    delay: 0.1,
  },
  {
    title: "Upload your invoice",
    description: "Upload your invoice and optionally add coupons for customers who submit feedback",
    icon: Upload,
    delay: 0.2,
  },
  {
    title: "Get merged PDF",
    description: "Our system extracts invoice number and returns a merged PDF with QR code/link to feedback form",
    icon: QrCode,
    delay: 0.3,
  },
  {
    title: "Send to customer",
    description: "Send the PDF to your customer - they scan and submit feedback anonymously",
    icon: Send,
    delay: 0.4,
  },
  {
    title: "View feedback",
    description: "Access feedback in your dashboard with full analytics and insights",
    icon: MessageSquare,
    delay: 0.5,
  },
];

const HowItWorksSection = () => {
  return (
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
            How InvisiFeed Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Simple steps to collect honest, anonymous feedback from your customers
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: step.delay }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-2 border-yellow-400/30 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-yellow-400/10">
                      <Icon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-yellow-400 font-medium mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                  
                  
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 