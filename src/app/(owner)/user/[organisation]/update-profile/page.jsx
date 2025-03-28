"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Save, Edit2, Check, X } from "lucide-react";
import axios from "axios";

function UpdateProfilePage() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    phoneNumber: "",
    address: {
      localAddress: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
    },
  });

  // Location data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post("/api/get-owner-info", {
          username: owner?.username,
        });
        const userData = response.data.data;
        setFormData(userData);
        
        // Initialize location data
        const fetchedCountries = Country.getAllCountries();
        setCountries(fetchedCountries);

        if (userData?.address?.country) {
          const countryCode = fetchedCountries.find(
            (c) => c.name === userData.address.country
          )?.isoCode;

          if (countryCode) {
            const fetchedStates = State.getStatesOfCountry(countryCode);
            setStates(fetchedStates);

            if (userData?.address?.state) {
              const stateCode = fetchedStates.find(
                (s) => s.name === userData.address.state
              )?.isoCode;

              if (stateCode) {
                const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
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
      fetchUserData();
    }
  }, [owner]);

  // Add validation function
  const validateField = (field, value) => {
    if (!value || value.trim() === "") {
      toast.error(`${field} cannot be empty`);
      return false;
    }
    return true;
  };

  // Add address validation function
  const validateAddress = () => {
    const { country, state, city, localAddress, pincode } = formData.address;
    
    if (!country || country.trim() === "") {
      toast.error("Country is required");
      return false;
    }
    if (!state || state.trim() === "") {
      toast.error("State is required");
      return false;
    }
    if (!city || city.trim() === "") {
      toast.error("City is required");
      return false;
    }
    if (!localAddress || localAddress.trim() === "") {
      toast.error("Local Address is required");
      return false;
    }
    if (!pincode || pincode.trim() === "") {
      toast.error("Pincode is required");
      return false;
    }
    return true;
  };

  // Handle country change
  const handleCountryChange = (countryName) => {
    if (!validateField("Country", countryName)) return;

    const countryCode = countries.find(
      (c) => c.name === countryName
    )?.isoCode;

    if (countryCode) {
      const fetchedStates = State.getStatesOfCountry(countryCode);
      setStates(fetchedStates);
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          country: countryName,
          state: "",
          city: "",
          localAddress: "",
          pincode: "",
        },
      }));
    }
  };

  // Handle state change
  const handleStateChange = (stateName) => {
    if (!validateField("State", stateName)) return;

    const countryCode = countries.find(
      (c) => c.name === formData.address.country
    )?.isoCode;

    const stateCode = states.find(
      (s) => s.name === stateName
    )?.isoCode;

    if (countryCode && stateCode) {
      const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(fetchedCities);
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          state: stateName,
          city: "",
          localAddress: "",
          pincode: "",
        },
      }));
    }
  };

  // Handle city change
  const handleCityChange = (cityName) => {
    if (!validateField("City", cityName)) return;

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: cityName,
        localAddress: "",
        pincode: "",
      },
    }));
  };

  // Handle field edit
  const handleEdit = (field) => {
    if (field === "address") {
      setEditingField("address");
    } else {
      setEditingField(field);
    }
  };

  // Update handleSave function
  const handleSave = async (field) => {
    try {
      setSaving(true);
      
      // Validate fields before saving
      if (field === "address") {
        if (!validateAddress()) {
          setSaving(false);
          return;
        }
      } else {
        if (!validateField(field, formData[field])) {
          setSaving(false);
          return;
        }
      }

      const response = await axios.post("/api/update-profile", {
        username: owner?.username,
        updates: field === "address" ? { address: formData.address } : {
          [field]: formData[field],
        },
      });
      
      if (response.status === 200) {
        setEditingField(null);
        toast.success(`${field === "address" ? "Address" : field} updated successfully`);
      }
    } catch (error) {
      toast.error(`Failed to update ${field === "address" ? "address" : field}`);
    } finally {
      setSaving(false);
    }
  };

  // Update handleChange to include validation
  const handleChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      if (!validateField(addressField, value)) return;
      
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      if (!validateField(field, value)) return;
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl shadow-lg shadow-yellow-400/5">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                Your Profile
              </h1>
              <p className="text-gray-400">
                View and update your profile information below.
              </p>
            </div>

            <div className="space-y-6">
              {/* Organization Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2"
              >
                <Label className="text-gray-200">Organization Name</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter Organisation Name"
                    className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                    disabled={editingField !== "organizationName"}
                    value={formData.organizationName}
                    onChange={(e) => handleChange("organizationName", e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => editingField === "organizationName" ? handleSave("organizationName") : handleEdit("organizationName")}
                    className="px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingField === "organizationName" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Phone Number */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-gray-200">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="Enter Phone Number"
                    className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                    disabled={editingField !== "phoneNumber"}
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => editingField === "phoneNumber" ? handleSave("phoneNumber") : handleEdit("phoneNumber")}
                    className="px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingField === "phoneNumber" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Location Fields */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-gray-200 text-lg">Address Information</Label>
                  <Button
                    type="button"
                    onClick={() => editingField === "address" ? handleSave("address") : handleEdit("address")}
                    className="px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingField === "address" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Country */}
                  <div className="space-y-2">
                    <Label className="text-gray-200">Country</Label>
                    <Select
                      value={formData.address.country}
                      onValueChange={handleCountryChange}
                      disabled={editingField !== "address"}
                    >
                      <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
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
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label className="text-gray-200">State</Label>
                    <Select
                      value={formData.address.state}
                      onValueChange={handleStateChange}
                      disabled={editingField !== "address" || !formData.address.country}
                    >
                      <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
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
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label className="text-gray-200">City</Label>
                    <Select
                      value={formData.address.city}
                      onValueChange={handleCityChange}
                      disabled={editingField !== "address" || !formData.address.state}
                    >
                      <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
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
                  </div>
                </div>

                {/* Local Address */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Local Address</Label>
                  <Input
                    type="text"
                    placeholder="Enter Local Address"
                    className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                    disabled={editingField !== "address"}
                    value={formData.address.localAddress}
                    onChange={(e) => handleChange("address.localAddress", e.target.value)}
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Pincode</Label>
                  <Input
                    type="text"
                    placeholder="Enter Pincode"
                    className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                    disabled={editingField !== "address"}
                    value={formData.address.pincode}
                    onChange={(e) => handleChange("address.pincode", e.target.value)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UpdateProfilePage;
