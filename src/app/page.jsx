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
import { useEffect } from "react";
import axios from "axios";
const Page = () => {
  // Dummy data for the carousel messages
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const getBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/get-businesses");

      // Extract the data array from the nested structure
      if (response.data && response.data.data) {
        setBusinesses(response.data.data); // response.data.data contains the array of businesses
      } else {
        console.error("Unexpected API response structure:", response.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch businesses:",
        error.response?.data?.message || error.message
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getBusinesses(); // Fetch data on component mount
  }, [getBusinesses]);
  return (
    <>
      {/* Navbar with updated links */}
      <Navbar />

      {/* Hero Section with Carousel */}
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

      {/* Main Content Section */}
      <main className="p-6 md:p-12 bg-gray-50 min-h-screen" id="businesses">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 text-center ml-6">
            Top Rated Businesses
          </h2>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search Top Rated Businesses..."
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.length > 0 ? (
            businesses.map((business) => (
              <div
                key={business._id} // Using a unique key from your API response
                className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {business.organizationName} {/* Business Name */}
                </h3>
                <p className="text-gray-600">
                  Email: {business.email} {/* Business Email */}
                </p>
                <p className="text-gray-600 mt-2">
                  {/* Add other fields you want to display */}
                  Address: {business.address}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No businesses found. Please try again later!
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Page;
