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
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import axios from "axios";

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-white">
            Join InvisiFeed
          </h1>
          <p className="mb-4 text-gray-300">
            Start your journey to honest, anonymous feedback
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Organisation Details */}
            {step === 1 && (
              <>
                {/* Organisation Name */}
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter Organisation Name"
                          {...field}
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
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
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Local Address */}
                <Input
                  value={localAddress}
                  onChange={(e) => setLocalAddress(e.target.value)}
                  placeholder="Enter Local Address"
                  className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
                />

                {/* Country Dropdown */}
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-gray-100 border-gray-600 cursor-pointer"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>

                {/* State Dropdown */}
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-gray-100 border-gray-600 cursor-pointer"
                  disabled={!selectedCountry}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>

                {/* City Dropdown */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-700 text-gray-100 border-gray-600 cursor-pointer"
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>

                {/* Pincode */}
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter Pincode"
                  className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
                />

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 hover:bg-gray-300 text-black cursor-pointer"
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
              </>
            )}

            {/* Step 2: User Credentials */}
            {step === 2 && (
              <>
                <div className="flex justify-start mb-4">
                  <button
                    className="flex items-center gap-2 text-gray-300 hover:text-gray-100"
                    onClick={() => setStep(1)}
                  >
                    <IoIosArrowBack className="h-5 w-5 cursor-pointer" />
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
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter Username"
                          {...field}
                          className="bg-gray-700 text-white border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
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
                            className="bg-gray-700 text-white border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
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
                            className="bg-gray-700 text-white border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 hover:bg-gray-300 text-black cursor-pointer"
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
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;