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
import { registerSchema } from "@/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
      address: "",
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

    // 👇 Address ko update kar rahe hain yahan
    const formattedAddress = `${localAddress}, ${selectedCity}, ${selectedState}, ${selectedCountry}, ${pincode}`;
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
      toast({
        title: "Error",
        description: "Please fill all fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  // ✅ Form Submit
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/register", data);
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Sign-up failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join InvisiFeed
          </h1>
          <p className="mb-4">
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
                        <Input placeholder="Enter Phone Number" {...field} />
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
                  className="w-full p-2 border rounded"
                />

                {/* Country Dropdown */}
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="w-full"
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter Email" {...field} />
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
                        <Input placeholder="Enter Username" {...field} />
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
                        <Input
                          type="password"
                          placeholder="Enter Password"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
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
