"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, MessageSquare, BarChart, Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const heroContent = [
  {
    title: "Transform Your Organization",
    subtitle: "Empower your team with honest, anonymous feedback",
    description: "Create a culture of trust and transparency with our secure feedback system",
    icon: Shield,
    gradient: "from-yellow-500 to-yellow-400",
  },
  {
    title: "Real-Time Insights",
    subtitle: "Make data-driven decisions",
    description: "Get instant analytics and insights to improve your organization's performance",
    icon: BarChart,
    gradient: "from-yellow-500 to-yellow-400",
  },
  {
    title: "Build Trust",
    subtitle: "Foster open communication",
    description: "Enable your team to share feedback freely and anonymously",
    icon: MessageSquare,
    gradient: "from-yellow-500 to-yellow-400",
  },
  {
    title: "Engage Your Team",
    subtitle: "Strengthen team dynamics",
    description: "Create an environment where every voice matters and contributes to growth",
    icon: Users,
    gradient: "from-yellow-500 to-yellow-400",
  },
];

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0A0A0A]" id="home">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />
      
      <Carousel
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full relative"
      >
        <CarouselContent className="-ml-0">
          {heroContent.map((content, index) => {
            const Icon = content.icon;
            return (
              <CarouselItem key={index} className="pl-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-screen w-full"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${content.gradient} opacity-5`} />
                  
                  {/* Content Container */}
                  <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-24 h-24 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10"
                      >
                        <Icon className="w-12 h-12 text-yellow-400" />
                      </motion.div>
                      
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                      >
                        {content.title}
                      </motion.h2>
                      
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-2xl md:text-3xl text-yellow-400 mb-8 font-medium"
                      >
                        {content.subtitle}
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-gray-300 text-xl max-w-3xl mb-12 leading-relaxed"
                      >
                        {content.description}
                      </motion.p>
                      
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="group flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105"
                      >
                        <span className="text-lg">Get Started</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="relative pointer-events-auto">
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0A0A0A]/30 backdrop-blur-sm border-yellow-400/20 text-yellow-400 hover:bg-[#0A0A0A]/50 hover:text-yellow-300 transition-all duration-300 rounded-full shadow-lg hover:scale-110" />
          </div>
          <div className="relative pointer-events-auto">
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0A0A0A]/30 backdrop-blur-sm border-yellow-400/20 text-yellow-400 hover:bg-[#0A0A0A]/50 hover:text-yellow-300 transition-all duration-300 rounded-full shadow-lg hover:scale-110" />
          </div>
        </div>
      </Carousel>
    </section>
  );
}

export default HeroSection;
