"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import * as z from "zod";
import MobileLogo from "@/components/MobileLogo";
import GSTINVerificationDialog from "@/components/owner-page-components/GSTINVerificationDialog";

// Profile completion schema
const completeProfileSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    localAddress: z.string().min(1, "Local address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pincode: z.string().min(1, "Pincode is required"),
  }),
});

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping , setIsSkipping] = useState(false) 
  const [isNavigatingToUserPage, setIsNavigatingToUserPage] = useState(false);

  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");

  // Add state to control when to show validation
  const [showValidation, setShowValidation] = useState(false);

  const [isGSTINDialogOpen, setIsGSTINDialogOpen] = useState(false);

  // Redirect authenticated users with completed profiles
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (
      session.user.isProfileCompleted === "completed" ||
      session.user.isProfileCompleted === "skipped"
    ) {
      router.push(`/user/${session?.user?.username}`);
    }
  }, [session, status, router]);

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

  // Fetch Countries using country-state-city
  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  // Fetch states based on country
  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find(
        (country) => country.name === selectedCountry
      );
      if (countryData) {
        const fetchedStates = State.getStatesOfCountry(countryData.isoCode);
        setStates(fetchedStates);
        setSelectedState("");
        setSelectedCity("");
        setCities([]);
      }
    }
  }, [selectedCountry, countries]);

  // Fetch cities based on state
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const countryData = countries.find(
        (country) => country.name === selectedCountry
      );
      const stateData = states.find((state) => state.name === selectedState);

      if (countryData && stateData) {
        const fetchedCities = City.getCitiesOfState(
          countryData.isoCode,
          stateData.isoCode
        );
        setCities(fetchedCities);
        setSelectedCity("");
      }
    }
  }, [selectedState, selectedCountry, states, countries]);

  // Filter functions
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(searchState.toLowerCase())
  );

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  // Form Setup
  const form = useForm({
    resolver: zodResolver(completeProfileSchema),
    mode: "onSubmit",
    defaultValues: {
      organizationName: session?.user?.organizationName || "",
      phoneNumber: "",
      address: {
        localAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
    },
  });

  // Update form when session is loaded
  useEffect(() => {
    if (session?.user) {
      form.setValue("organizationName", session.user.organizationName || "");
    }
  }, [session, form]);
  console.log(session);

  // Add validation state for each field
  const [fieldErrors, setFieldErrors] = useState({
    organizationName: false,
    phoneNumber: false,
    country: false,
    state: false,
    city: false,
    localAddress: false,
    pincode: false,
  });

  // Function to validate all fields
  const validateFields = () => {
    const newErrors = {
      organizationName:
        !form.getValues("organizationName")?.trim() &&
        !session?.user?.organizationName,
      phoneNumber: !form.getValues("phoneNumber")?.trim(),
      country: !selectedCountry?.trim(),
      state: !selectedState?.trim(),
      city: !selectedCity?.trim(),
      localAddress: !localAddress?.trim(),
      pincode: !pincode?.trim(),
    };
    setFieldErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Update useEffect to validate fields when values change and showValidation is true
  useEffect(() => {
    if (showValidation) {
      validateFields();
    }
  }, [
    form.getValues("organizationName"),
    form.getValues("phoneNumber"),
    selectedCountry,
    selectedState,
    selectedCity,
    localAddress,
    pincode,
    showValidation,
  ]);

  // Form Submit
  const onSubmit = async (formData) => {
    setShowValidation(true);

    // Move validation check after setting showValidation
    const isValid = validateFields();
    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the address data
      const formattedAddress = {
        localAddress: localAddress,
        city: selectedCity,
        state: selectedState,
        country: selectedCountry,
        pincode: pincode,
      };

      // Submit the profile data
      const { data } = await axios.patch("/api/complete-profile", {
        organizationName: formData.organizationName,
        phoneNumber: formData.phoneNumber,
        address: formattedAddress,
      });

      if (data.success) {
        toast.success("Profile completed successfully!");

        // Update the session to reflect the new profile status
        await update({
          ...session,
          user: {
            ...session.user,
            organizationName: data.updatedUser.organizationName,
            phoneNumber: data.updatedUser.phoneNumber,
            address: data.updatedUser.address,
            isProfileCompleted: data.profileStatus,
          },
        });

        // Redirect to user page
        setIsNavigatingToUserPage(true);
        router.push(`/user/${session?.user?.username}`);
      } else {
        toast.error(data.message || "Failed to complete profile");
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while completing your profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form values when dropdowns change
  useEffect(() => {
    if (selectedCountry) {
      form.setValue("address.country", selectedCountry);
    }
    if (selectedState) {
      form.setValue("address.state", selectedState);
    }
    if (selectedCity) {
      form.setValue("address.city", selectedCity);
    }
  }, [selectedCountry, selectedState, selectedCity, form]);

  // Update form values when local address and pincode change
  useEffect(() => {
    form.setValue("address.localAddress", localAddress);
    form.setValue("address.pincode", pincode);
  }, [localAddress, pincode, form]);

  // Handle "I'll do it later" button click
  const handleSkipProfile = async () => {
    setShowValidation(false);
    try {
      setIsSkipping(true);

      // Submit empty data with skipProfile flag
      const { data } = await axios.patch("/api/complete-profile", {
        organizationName: session.user.organizationName || "",
        phoneNumber: "",
        address: {
          localAddress: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        skipProfile: true, // Flag to indicate this is a skip request
      });

      if (data.success) {
        toast.success(data.message);
        setIsSkipping(false);

        // Update the session to reflect the new profile status
        await update({
          ...session,
          user: {
            ...session.user,
            isProfileCompleted: data.profileStatus,
          },
        });

        // Redirect to user page
        setIsNavigatingToUserPage(true);
        router.push(`/user/${session?.user?.username}`);
      } else {
        toast.error(data.message || "Failed to skip profile completion");
        setIsSkipping(false);
      }
    } catch (error) {
      console.error("Error skipping profile:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while skipping profile completion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set initial organization name from session
  useEffect(() => {
    if (session?.user?.organizationName) {
      form.setValue("organizationName", session.user.organizationName);
    }
  }, [session, form]);

  if (status === "loading" || !session || isNavigatingToUserPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Toaster position="top-center" richColors />
      {/* Main Content Section */}
      <div className="w-full flex flex-col items-center p-6 pb-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <MobileLogo />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-4"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Complete Your Profile
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                We need a few more details to set up your account
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={() => setIsGSTINDialogOpen(true)}
                className="bg-transparent hover:bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium px-4 py-2 rounded-full transition-all duration-200"
              >
                {session?.user?.gstinDetails?.gstinVerificationStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    GSTIN Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Verify GSTIN
                  </div>
                )}
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter Organisation Name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (showValidation) {
                                  validateFields();
                                }
                              }}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none rounded-md"
                            />
                            {showValidation && fieldErrors.organizationName && (
                              <p className="text-[11px] text-red-500 mt-1">
                                Organization name is required
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter Phone Number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (showValidation) {
                                  validateFields();
                                }
                              }}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none rounded-md"
                            />
                            {showValidation && fieldErrors.phoneNumber && (
                              <p className="text-[11px] text-red-500 mt-1">
                                Phone number is required
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Country Dropdown */}
                  <div className="relative" ref={countryRef}>
                    <div
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none"
                    >
                      <span
                        className={
                          selectedCountry ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedCountry || "Select Country"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isCountryOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {showValidation && fieldErrors.country && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Country is required
                      </p>
                    )}
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
                                selectedCountry === country.name
                                  ? "bg-yellow-400/20"
                                  : ""
                              }`}
                            >
                              {country.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* State Dropdown */}
                  <div className="relative" ref={stateRef}>
                    <div
                      onClick={() =>
                        !selectedCountry || setIsStateOpen(!isStateOpen)
                      }
                      className={`w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none ${
                        !selectedCountry ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={
                          selectedState ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedState || "Select State"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isStateOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {showValidation && fieldErrors.state && (
                      <p className="text-[11px] text-red-500 mt-1">
                        State is required
                      </p>
                    )}
                    {isStateOpen && states.length > 0 && (
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
                                selectedState === state.name
                                  ? "bg-yellow-400/20"
                                  : ""
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
                      onClick={() =>
                        !selectedState || setIsCityOpen(!isCityOpen)
                      }
                      className={`w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none ${
                        !selectedState ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={
                          selectedCity ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedCity || "Select City"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isCityOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {showValidation && fieldErrors.city && (
                      <p className="text-[11px] text-red-500 mt-1">
                        City is required
                      </p>
                    )}
                    {isCityOpen && cities.length > 0 && (
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
                                selectedCity === city.name
                                  ? "bg-yellow-400/20"
                                  : ""
                              }`}
                            >
                              {city.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local Address */}
                  <div className="relative">
                    <Input
                      value={localAddress}
                      onChange={(e) => {
                        setLocalAddress(e.target.value);
                        if (showValidation) {
                          validateFields();
                        }
                      }}
                      placeholder="Enter Local Address"
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none"
                    />
                    {showValidation && fieldErrors.localAddress && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Local address is required
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="relative">
                    <Input
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        if (showValidation) {
                          validateFields();
                        }
                      }}
                      placeholder="Enter Pincode"
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none"
                    />
                    {showValidation && fieldErrors.pincode && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Pincode is required
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                      onClick={() => {
                        if (!form.formState.isValid) {
                          setShowValidation(true);
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSkipProfile}
                      disabled={isSubmitting || isSkipping}
                      className="w-full bg-transparent hover:bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium cursor-pointer h-9"
                    >
                      {isSkipping ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "I'll do it later"
                      )}
                    </Button>
                  </div>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>

      <GSTINVerificationDialog
        open={isGSTINDialogOpen}
        onOpenChange={setIsGSTINDialogOpen}
      />
    </div>
  );
}

export default Page;
