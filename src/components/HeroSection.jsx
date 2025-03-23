import React from "react";

import feedbackData from "@/app/store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
function HeroSection() {
  return (
    <section
      className="h-screen flex items-center justify-center bg-gray-50"
      id="home"
    >
      <Carousel
        plugins={[Autoplay({ delay: 2500 })]}
        className="w-full max-w-5xl h-4/5 rounded-2xl"
      >
        <CarouselContent className="h-full ">
          {feedbackData.map((feedback, index) => (
            <CarouselItem key={index} className="h-[calc(100vh-4rem)]">
              <div className="relative h-full w-full flex items-center justify-center">
                {/* Background Image */}
                <img
                  src={feedback.image}
                  alt={feedback.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // Adjust transparency here
                ></div>
                {/* Text Content */}
                <div className="relative z-10 p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-400 mb-4">
                    {feedback.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-300">
                    {feedback.mini}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-500 transition" />
        <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-500 transition" />
      </Carousel>
    </section>
  );
}

export default HeroSection;
