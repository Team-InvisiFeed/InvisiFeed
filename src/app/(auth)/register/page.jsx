"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { IoIosArrowBack } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Show Password State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState({ isChecking: false, isAvailable: true, message: '' });
  const usernameCheckTimeout = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch Countries using country-state-city
  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  // ✅ Fetch states based on country
  useEffect(() => {
    if (selectedCountry) {
      const countryCode = countries.find(
        (country) => country.name === selectedCountry
      )?.isoCode;

      if (countryCode) {
        const fetchedStates = State.getStatesOfCountry(countryCode);
        setStates(fetchedStates);
        setSelectedState("");
        setCities([]);
      }
    }
  }, [selectedCountry, countries]);

  // ✅ Fetch cities based on state
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const countryCode = countries.find(
        (country) => country.name === selectedCountry
      )?.isoCode;

      const stateCode = states.find(
        (state) => state.name === selectedState
      )?.isoCode;

      if (countryCode && stateCode) {
        const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
        setCities(fetchedCities);
        setSelectedCity("");
      }
    }
  }, [selectedState, selectedCountry, states]);

  // Filter functions
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchState.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  // ✅ Form Setup
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      address: {
        localAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      phoneNumber: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ✅ Handle Next Step
  const handleNext = () => {
    const { organizationName, phoneNumber } = form.getValues();

    const formattedAddress = {
      localAddress: localAddress.trim(),
      city: selectedCity.trim(),
      state: selectedState.trim(),
      country: selectedCountry.trim(),
      pincode: pincode.trim(),
    };

    form.setValue("address", formattedAddress);

    if (
      organizationName &&
      phoneNumber &&
      localAddress &&
      selectedCity &&
      selectedState &&
      selectedCountry &&
      pincode
    ) {
      setTimeout(() => setStep(2), 0);
    } else {
      toast("Please fill all fields before proceeding.");
    }
  };

  // ✅ Form Submit
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/register", data);
      toast(response.data.message);
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      toast("Sign-up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add username availability check function
  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameStatus({ isChecking: false, isAvailable: true, message: '' });
      return;
    }

    try {
      const response = await axios.get(`/api/check-username-unique?username=${encodeURIComponent(username)}`);
      setUsernameStatus({
        isChecking: false,
        isAvailable: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Username not available'
      });
    }
  };

  // Add debounced username check
  const debouncedUsernameCheck = (username) => {
    setUsernameStatus(prev => ({ ...prev, isChecking: true }));
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 1000); // 1 second delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            InvisiFeed
          </h1>
          <p className="text-lg text-gray-200">
            Transform your organization with honest, anonymous feedback
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Secure and anonymous feedback system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Real-time insights and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Build a culture of trust and transparency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0A0A0A]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-4"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Join InvisiFeed and start your journey
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter Organisation Name"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter Phone Number"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Country Dropdown */}
                    <div className="relative" ref={countryRef}>
                      <div
                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                        className="w-full p-2 border rounded bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200"
                      >
                        <span className={selectedCountry ? "text-white" : "text-gray-400"}>
                          {selectedCountry || "Select Country"}
                        </span>
                        <svg 
                          className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isCountryOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                          <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                            <input
                              type="text"
                              placeholder="Search country..."
                              value={searchCountry}
                              onChange={(e) => setSearchCountry(e.target.value)}
                              className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                              autoFocus
                            />
                          </div>
                          <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                            {filteredCountries.map((country) => (
                              <div
                                key={country.isoCode}
                                onClick={() => {
                                  setSelectedCountry(country.name);
                                  setIsCountryOpen(false);
                                  setSearchCountry("");
                                }}
                                className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                  selectedCountry === country.name ? "bg-yellow-400/20" : ""
                                }`}
                              >
                                {country.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* State and City Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* State Dropdown */}
                      <div className="relative" ref={stateRef}>
                        <div
                          onClick={() => !selectedCountry || setIsStateOpen(!isStateOpen)}
                          className={`w-full p-2 border rounded bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 ${
                            !selectedCountry ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <span className={selectedState ? "text-white" : "text-gray-400"}>
                            {selectedState || "Select State"}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${isStateOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {isStateOpen && selectedCountry && (
                          <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                            <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                              <input
                                type="text"
                                placeholder="Search state..."
                                value={searchState}
                                onChange={(e) => setSearchState(e.target.value)}
                                className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                              {filteredStates.map((state) => (
                                <div
                                  key={state.isoCode}
                                  onClick={() => {
                                    setSelectedState(state.name);
                                    setIsStateOpen(false);
                                    setSearchState("");
                                  }}
                                  className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                    selectedState === state.name ? "bg-yellow-400/20" : ""
                                  }`}
                                >
                                  {state.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* City Dropdown */}
                      <div className="relative" ref={cityRef}>
                        <div
                          onClick={() => !selectedState || setIsCityOpen(!isCityOpen)}
                          className={`w-full p-2 border rounded bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 ${
                            !selectedState ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <span className={selectedCity ? "text-white" : "text-gray-400"}>
                            {selectedCity || "Select City"}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${isCityOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {isCityOpen && selectedState && (
                          <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                            <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                              <input
                                type="text"
                                placeholder="Search city..."
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                              {filteredCities.map((city) => (
                                <div
                                  key={city.name}
                                  onClick={() => {
                                    setSelectedCity(city.name);
                                    setIsCityOpen(false);
                                    setSearchCity("");
                                  }}
                                  className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                    selectedCity === city.name ? "bg-yellow-400/20" : ""
                                  }`}
                                >
                                  {city.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Local Address */}
                    <Input
                      value={localAddress}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      placeholder="Enter Local Address"
                      className="w-full p-2 border rounded bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                    />

                    {/* Pincode */}
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter Pincode"
                      className="w-full p-2 border rounded bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                    />

                    {/* Next Button */}
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Next"
                      )}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                      <p className="text-gray-400 text-sm">
                        Already a user?{" "}
                        <button
                          onClick={() => {
                            setIsNavigatingToSignIn(true);
                            router.push('/sign-in');
                          }}
                          disabled={isNavigatingToSignIn}
                          className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center cursor-pointer"
                        >
                          {isNavigatingToSignIn ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Login"
                          )}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-start mb-2">
                      <button
                        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                        onClick={() => setStep(1)}
                      >
                        <IoIosArrowBack className="h-4 w-4 cursor-pointer" />
                        Back
                      </button>
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter Email"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter Username"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  debouncedUsernameCheck(e.target.value);
                                }}
                                className={`bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 ${
                                  !usernameStatus.isAvailable && field.value ? 'border-red-400' : ''
                                }`}
                              />
                              {field.value && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                  {usernameStatus.isChecking ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                  ) : !usernameStatus.isAvailable ? (
                                    <span className="text-xs text-red-400">
                                      {usernameStatus.message}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-green-400">
                                      Username available
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                {...field}
                                className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                {...field}
                                className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                      <p className="text-gray-400 text-sm">
                        Already a user?{" "}
                        <button
                          onClick={() => {
                            setIsNavigatingToSignIn(true);
                            router.push('/sign-in');
                          }}
                          disabled={isNavigatingToSignIn}
                          className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center cursor-pointer"
                        >
                          {isNavigatingToSignIn ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Login"
                          )}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;