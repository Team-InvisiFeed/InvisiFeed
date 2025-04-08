"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, QrCode, MessageSquare, CheckCircle, Star, ThumbsUp, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-[#0A0A0A]" id="home">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-full flex-row items-center justify-center gap-6 sm:gap-8 py-6 sm:py-8">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-left w-full md:w-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight"
            >
              Get Honest Feedback. <p className="text-yellow-400 text-2xl sm:text-3xl md:text-4xl font-bold">No Awkward Conversations.</p>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed max-w-xl"
            >
              InvisiFeed helps you embed AI-powered feedback forms inside your invoices so customers can give feedback anonymously.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer group flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 w-full sm:w-auto"
                onClick={() => router.push('/register')}
              >
                <span className="text-sm sm:text-base">Generate Your First Feedback PDF</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative w-full md:w-auto mt-6 md:mt-0"
          >
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]">
              {/* Invoice with QR Code */}
              <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-white rounded-lg shadow-2xl transform rotate-3 z-10">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">INVOICE</h3>
                    <div className="text-xs text-gray-500">#INV-2023-001</div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mb-3 sm:mb-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-xs text-gray-500">From:</p>
                        <p className="text-xs sm:text-sm font-medium">Your Business Name</p>
                        <p className="text-xs">123 Business St</p>
                        <p className="text-xs">City, State 12345</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">To:</p>
                        <p className="text-xs sm:text-sm font-medium">Client Name</p>
                        <p className="text-xs">456 Client Ave</p>
                        <p className="text-xs">City, State 67890</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mb-3 sm:mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="pb-1">Description</th>
                          <th className="pb-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-100">
                          <td className="py-1 text-xs sm:text-sm">Service Description</td>
                          <td className="py-1 text-xs sm:text-sm">$1,000.00</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td className="py-1 text-xs sm:text-sm font-medium">Total</td>
                          <td className="py-1 text-xs sm:text-sm font-medium">$1,000.00</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 sm:pt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Thank you for your business!
                    </div>
                    <div className="flex items-center space-x-1">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      <span className="text-xs font-medium text-yellow-500">Scan for feedback</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Feedback Popup */}
              <div className="absolute bottom-0 left-0 w-[70%] h-[60%] bg-white rounded-lg shadow-2xl transform -rotate-2 z-20">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">Anonymous Feedback</h3>
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs text-gray-600 mb-2 sm:mb-3">
                      We value your honest feedback to improve our services. Your response is completely anonymous.
                    </p>
                    
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs font-medium mb-1">Overall Experience</p>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-500 text-xs">★</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs font-medium mb-1">What did you like most?</p>
                      <textarea 
                        className="w-full p-2 border border-gray-200 rounded-md text-xs" 
                        rows="1"
                        placeholder="Your feedback here..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Layout - Redesigned */}
        <div className="md:hidden flex flex-col items-center justify-between py-25 px-4 h-[calc(100vh-80px)]">
          {/* Mobile Hero Content with Visual Elements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-between h-full"
          >
            {/* Top Visual Element - Feedback Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-xs mx-auto mb-6 relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-xl p-4 border border-yellow-400/20 shadow-lg">
                <p className="text-sm text-gray-300 italic text-center">
                  "The anonymous feedback helped us improve our service quality by 40% in just 3 months!"
                </p>
                <div className="flex justify-center mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl font-bold text-white mb-3 text-center leading-tight"
            >
              Get Honest Feedback. <p className="text-yellow-400">No Awkward Conversations.</p>
            </motion.h1>
            
            {/* Brief Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-gray-300 mb-6 text-center max-w-xs"
            >
              Embed AI-powered feedback forms in your invoices for anonymous customer insights.
            </motion.p>

            {/* Feature Icons Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-center space-x-8 mb-8"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-2">
                  <QrCode className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-xs text-gray-300">QR Code</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-xs text-gray-300">Anonymous</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-xs text-gray-300">AI-Powered</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full max-w-xs mx-auto mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer group w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
                onClick={() => router.push('/register')}
              >
                <span className="text-base">Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>

            {/* Bottom Visual Element - Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-full max-w-xs mx-auto"
            >
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 rounded-xl p-4 border border-yellow-400/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ThumbsUp className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-sm text-gray-300">98% Response Rate</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-sm text-gray-300">100% Anonymous</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
