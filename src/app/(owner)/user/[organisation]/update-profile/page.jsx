"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check, Edit2 } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.object({
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    localAddress: z.string().min(1, "Local address is required"),
    pincode: z.string().min(1, "Pincode is required"),
  }),
});

function UpdateProfilePage() {
  const { data: session, update } = useSession();
  const owner = session?.user;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      phoneNumber: "",
      address: {
        country: "",
        state: "",
        city: "",
        localAddress: "",
        pincode: "",
      },
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch countries
        const fetchedCountries = Country.getAllCountries();
        setCountries(fetchedCountries);

        // Fetch user data
        const response = await axios.post("/api/get-owner-info", {
          username: owner?.username,
        });
        const userData = response.data.data;
        form.reset(userData);

        // If user has country selected, fetch states
        if (userData?.address?.country) {
          const countryCode = fetchedCountries.find(
            (c) => c.name === userData.address.country
          )?.isoCode;

          if (countryCode) {
            const fetchedStates = State.getStatesOfCountry(countryCode);
            setStates(fetchedStates);

            // If user has state selected, fetch cities
            if (userData?.address?.state) {
              const stateCode = fetchedStates.find(
                (s) => s.name === userData.address.state
              )?.isoCode;

              if (stateCode) {
                const fetchedCities = City.getCitiesOfState(
                  countryCode,
                  stateCode
                );
                setCities(fetchedCities);
              }
            }
          }
        }
      } catch (error) {
        toast.error("Failed to fetch profile information");
      } finally {
        setLoading(false);
      }
    };

    if (owner?.username) {
      fetchData();
    }
  }, [owner?.username, form]);

  const handleCountryChange = (countryName) => {
    const countryCode = countries.find((c) => c.name === countryName)?.isoCode;
    if (countryCode) {
      const fetchedStates = State.getStatesOfCountry(countryCode);
      setStates(fetchedStates);
      form.setValue("address.country", countryName);
      form.setValue("address.state", "");
      form.setValue("address.city", "");
      form.setValue("address.localAddress", "");
      form.setValue("address.pincode", "");
    }
  };

  const handleStateChange = (stateName) => {
    const countryCode = countries.find(
      (c) => c.name === form.getValues("address.country")
    )?.isoCode;
    const stateCode = states.find((s) => s.name === stateName)?.isoCode;

    if (countryCode && stateCode) {
      const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(fetchedCities);
      form.setValue("address.state", stateName);
      form.setValue("address.city", "");
      form.setValue("address.localAddress", "");
      form.setValue("address.pincode", "");
    }
  };

  const handleCityChange = (cityName) => {
    form.setValue("address.city", cityName);
    form.setValue("address.localAddress", "");
    form.setValue("address.pincode", "");
  };

  const handleGlobalEdit = () => {
    if (editingField === "all") {
      // If already in edit mode, save the changes
      setEditingField(null);
    } else {
      // Enter edit mode
      setEditingField("all");
    }
  };

  const handleSaveProfile = async (data) => {
    if (editingField === "all") {
      toast.error(
        "Please save your current changes before updating the profile"
      );
      return;
    }
    const payload = {
      data,
      username: session?.user?.username,
    };

    try {
      setSaving(true);

      const response = await axios.post("/api/update-profile", payload);

      if (response.status === 200) {
        // Update session with new data
        await update({
          user: {
            ...session.user,
            organizationName:
              data.organizationName || session.user.organizationName,
            phoneNumber: data.phoneNumber || session.user.phoneNumber,
            address: data.address || session.user.address,
          },
        });

        toast.success("Profile updated successfully");
        setEditingField(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl shadow-lg shadow-yellow-400/5">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8 relative">
              <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                Your Profile
              </h1>
              <p className="text-gray-400">
                View and update your profile information below.
              </p>
              <Button
                type="button"
                onClick={handleGlobalEdit}
                className="absolute top-0 right-0 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
              >
                {editingField === "all" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Edit2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSaveProfile)}
                className="space-y-6"
              >
                {/* Organization Name */}
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Organization Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter Organisation Name"
                          className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                          disabled={editingField !== "all"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter Phone Number"
                          className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                          disabled={editingField !== "all"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-200 text-lg">
                      Address Information
                    </FormLabel>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            Country
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleCountryChange}
                            disabled={editingField !== "all"}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.isoCode}
                                  value={country.name}
                                  className="text-gray-200 hover:bg-yellow-400/10"
                                >
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">State</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleStateChange}
                            disabled={
                              editingField !== "all" ||
                              !form.getValues("address.country")
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                              {states.map((state) => (
                                <SelectItem
                                  key={state.isoCode}
                                  value={state.name}
                                  className="text-gray-200 hover:bg-yellow-400/10"
                                >
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">City</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleCityChange}
                            disabled={
                              editingField !== "all" ||
                              !form.getValues("address.state")
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                              {cities.map((city) => (
                                <SelectItem
                                  key={city.name}
                                  value={city.name}
                                  className="text-gray-200 hover:bg-yellow-400/10"
                                >
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Local Address */}
                  <FormField
                    control={form.control}
                    name="address.localAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Local Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter Local Address"
                            className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                            disabled={editingField !== "all"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pincode */}
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Pincode</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter Pincode"
                            className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                            disabled={editingField !== "all"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Save Profile Button */}
                <div className="flex justify-center mt-8">
                  <Button
                    type="submit"
                    disabled={saving || editingField === "all"}
                    className={`px-8 py-2 font-semibold ${
                      editingField !== "all"
                        ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving Profile...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfilePage;
