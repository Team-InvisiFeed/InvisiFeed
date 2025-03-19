"use client";
import Navbar from "@/components/Navbar";
import React, { useCallback, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Footer from "@/components/Footer";
import feedbackData from "./store";

const Page = () => {
  // Dummy data for the carousel messages
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const getBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/get-businesses");
      setBusinesses(response.data.businesses);
    } catch (error) {
      const axiosError = error;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  return (
    <>
      {/* Navbar with updated links */}
      <Navbar />

      {/* Hero Section with Carousel */}
      <section className="h-screen flex items-center justify-center bg-gray-50">
        <Carousel
          plugins={[Autoplay({ delay: 2500 })]}
          className="w-full max-w-5xl h-4/5"
        >
          <CarouselContent className="h-full">
            {feedbackData.map((feedback, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="p-4 h-full flex flex-col md:flex-row items-center">
                  {/* Left side: Image */}
                  <div className="w-full md:w-1/2 h-48 md:h-full flex items-center justify-center">
                    <img
                      src={feedback.image}
                      alt={feedback.title}
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                  </div>
                  {/* Right side: Content */}
                  <div className="w-full md:w-1/2 h-full flex flex-col justify-between p-4">
                    <Card className="h-full flex flex-col justify-between shadow-lg bg-gray-800 border border-teal-500 rounded-lg">
                      <CardHeader className="text-2xl font-semibold text-teal-400 text-center p-4">
                        {feedback.title}
                      </CardHeader>
                      <CardContent className="flex items-center justify-center p-4 bg-gray-900 flex-grow">
                        <span className="text-lg md:text-xl font-medium text-gray-300 text-center">
                          {feedback.mini}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-500 transition" />
          <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-500 transition" />
        </Carousel>
      </section>

      {/* Main Content Section */}
      <main className="p-6 md:p-12 bg-gray-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 text-center ml-6">
            Top Rated Businesses
          </h2>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search Top Rated Businesses..."
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder cards */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Business {item}
              </h3>
              <p className="text-gray-600">
                Discover the top-rated businesses in your area offering
                excellent services.
              </p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Page;
