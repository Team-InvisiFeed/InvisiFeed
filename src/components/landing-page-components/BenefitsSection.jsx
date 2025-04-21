"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  Award, 
  Gift, 
  Smile
} from "lucide-react";

const benefits = [
  {
    title: "Get Real, Honest Feedback",
    description: "Collect authentic feedback without confrontation or awkward conversations",
    icon: MessageSquare,
    delay: 0.1,
  },
  {
    title: "AI-Powered Insights",
    description: "Our AI helps summarize customer sentiment and identify key themes",
    icon: Brain,
    delay: 0.2,
  },
  {
    title: "Data-Driven Improvements",
    description: "Make informed decisions to enhance your services based on customer feedback",
    icon: TrendingUp,
    delay: 0.3,
  },
  {
    title: "Stand Out from Competition",
    description: "Demonstrate your commitment to customer satisfaction by acting on feedback",
    icon: Award,
    delay: 0.4,
  },
  {
    title: "Reward Your Customers",
    description: "Surprise your customers with coupons for submitting feedback",
    icon: Gift,
    delay: 0.5,
  },
  {
    title: "Easy to Use",
    description: "Our platform is designed to be user-friendly and easy to use",
    icon: Smile,
    delay: 0.6,
  },
];

const BenefitsSection = () => {
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
            Why Use InvisiFeed?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Discover how our platform can transform your customer feedback process
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: benefit.delay }}
              >
                <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6 h-full hover:border-yellow-400/20 transition-colors group">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-yellow-400 font-medium mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection; 