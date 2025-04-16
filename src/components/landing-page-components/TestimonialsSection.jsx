"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote: "InvisiFeed has transformed how I collect feedback from my clients. The anonymous nature encourages honest responses, and the insights have been invaluable for improving my services.",
    name: "Sarah Johnson",
    role: "Digital Marketer",
    avatar: "/avatars/avatar-1.jpg",
    rating: 5,
    delay: 0.1,
  },
  {
    quote: "As a photographer, I was struggling to get genuine feedback from clients. InvisiFeed solved this problem perfectly. The AI-generated insights help me understand exactly what my clients value most.",
    name: "Michael Chen",
    role: "Photographer",
    avatar: "/avatars/avatar-2.jpg",
    rating: 5,
    delay: 0.2,
  },
  {
    quote: "The integration with invoices is seamless, and my clients love the convenience. The feedback I've received has helped me refine my services and grow my business significantly.",
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    avatar: "/avatars/avatar-3.jpg",
    rating: 5,
    delay: 0.3,
  },
];

const TestimonialsSection = () => {
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
            What Our Users Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Hear from service providers who have transformed their feedback process with InvisiFeed
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: testimonial.delay }}
            >
              <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6 h-full hover:border-yellow-400/20 transition-colors group">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-yellow-400" 
                    />
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-medium">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 