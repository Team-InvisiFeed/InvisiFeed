"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
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
import axios from "axios";

function UpdateProfilePage() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [ownerInfo, setOwnerInfo] = useState({});
  const [editableFields, setEditableFields] = useState({});
  const [updatedFields, setUpdatedFields] = useState({});

  const fetchOwnerInfo = async () => {
    const response = await axios.post("/api/get-owner-info", {
      username: owner?.username,
    });
    const ownerInfo = response.data.data;
    return ownerInfo;
    console.log(updatedFields); // Initialize updatedFields with ownerInfo
  };

  useEffect(() => {
    const fetchAndSetOwnerInfo = async () => {
      const ownerInfo = await fetchOwnerInfo(); // Await the fetchOwnerInfo

      if (ownerInfo?.address) {
        setOwnerInfo(ownerInfo);
        setUpdatedFields(ownerInfo);
      }
    };

    if (owner?.username) {
      // Ensure owner is defined
      fetchAndSetOwnerInfo();
    }
  }, [owner]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryCode = countries.find(
        (country) => country.name === selectedCountry
      )?.isoCode;

      if (countryCode) {
        const fetchedStates = State.getStatesOfCountry(countryCode);
        setStates(fetchedStates);
        setSelectedState(""); // Reset state when country changes
        setCities([]); // Reset cities when country changes
      }
    }
  }, [selectedCountry, countries]);

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
        setSelectedCity(""); // Reset city when state changes
      }
    }
  }, [selectedState, selectedCountry, states]);

  const handleEdit = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleChange = (field, value) => {
    if (field === "country" && value !== ownerInfo?.address?.country) {
      setSelectedCountry(value); // Update selected country
      setSelectedState(""); // Reset state
      setSelectedCity(""); // Reset city

      setUpdatedFields((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          country: value,
          state: "", // Reset state in updatedFields
          city: "", // Reset city in updatedFields
          pincode: "",
        },
      }));
    } else if (field === "state" && value !== ownerInfo?.address?.state) {
      setSelectedState(value); // Update selected state
      setSelectedCity(""); // Reset city

      setUpdatedFields((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          state: value,
          city: "", // Reset city in updatedFields
          pincode: "",
        },
      }));
    } else if (field === "city") {
      setSelectedCity(value); // Update selected city
      setUpdatedFields((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          city: value,
          pincode: "",
        },
      }));
    } else {
      setUpdatedFields((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  useEffect(() => {
    // Check and update the fields actively
    if (selectedCountry !== ownerInfo?.address?.country) {
      handleChange("country", selectedCountry);
    }
    if (selectedState !== ownerInfo?.address?.state) {
      handleChange("state", selectedState);
    }
    if (selectedCity !== ownerInfo?.address?.city) {
      handleChange("city", selectedCity);
    }
  }, [selectedCountry, selectedState, selectedCity]);
  const handleApplyChanges = async () => {
    try {
      const response = await axios.post("/api/update-profile", {
        username: owner?.username,
        updates: updatedFields,
      });
      console.log("Profile updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Update Your Profile
          </h1>
          <p className="mb-4">
            Make changes to your profile information below.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Organisation Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter Organisation Name"
                className="w-full p-2 border rounded"
                disabled={!editableFields.organizationName}
                value={updatedFields.organizationName || ""}
                onChange={(e) =>
                  handleChange("organizationName", e.target.value)
                }
              />
              {editableFields.organizationName ? (
                <Button
                  type="button"
                  onClick={() => handleSave("organizationName")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("organizationName")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter Phone Number"
                className="w-full p-2 border rounded"
                disabled={!editableFields.phoneNumber}
                value={updatedFields.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
              {editableFields.phoneNumber ? (
                <Button
                  type="button"
                  onClick={() => handleSave("phoneNumber")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("phoneNumber")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Local Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Local Address
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter Local Address"
                className="w-full p-2 border rounded"
                disabled={!editableFields.localAddress}
                value={updatedFields?.address?.localAddress || ""}
                onChange={(e) => handleChange("localAddress", e.target.value)}
              />
              {editableFields.localAddress ? (
                <Button
                  type="button"
                  onClick={() => handleSave("localAddress")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("localAddress")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="flex items-center">
              <select
                className="w-full p-2 border rounded"
                value={selectedCountry}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={!editableFields.country}
              >
                <option value={updatedFields?.address?.country}>
                  {updatedFields?.address?.country}
                </option>

                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {editableFields.country ? (
                <Button
                  type="button"
                  onClick={() => handleSave("country")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("country")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* State Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <div className="flex items-center">
              <select
                className="w-full p-2 border rounded"
                disabled={!editableFields.state || !selectedCountry}
                value={selectedState}
                onChange={(e) => handleChange("state", e.target.value)}
              >
                {updatedFields?.address?.country ===
                ownerInfo?.address?.country ? (
                  <option value={updatedFields?.address?.state}>
                    {updatedFields?.address?.state}
                  </option>
                ) : (
                  <option value="">Select State</option>
                )}
                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
              {editableFields.state ? (
                <Button
                  type="button"
                  onClick={() => handleSave("state")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("state")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* City Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="flex items-center">
              <select
                className="w-full p-2 border rounded"
                disabled={!editableFields.city || !selectedState}
                value={selectedCity}
                onChange={(e) => handleChange("city", e.target.value)}
              >
                {updatedFields?.address?.state === ownerInfo?.address?.state ? (
                  <option value={updatedFields?.address?.city}>
                    {updatedFields?.address?.city}
                  </option>
                ) : (
                  <option value="">Select City</option>
                )}
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {editableFields.city ? (
                <Button
                  type="button"
                  onClick={() => handleSave("city")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("city")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter Pincode"
                className="w-full p-2 border rounded"
                disabled={!editableFields.pincode}
                value={updatedFields?.address?.pincode || ""}
                onChange={(e) => handleChange("pincode", e.target.value)}
              />
              {editableFields.pincode ? (
                <Button
                  type="button"
                  onClick={() => handleSave("pincode")}
                  className="ml-2"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleEdit("pincode")}
                  className="ml-2"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Apply Changes Button */}
          <button
            type="button"
            onClick={handleApplyChanges}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfilePage;
