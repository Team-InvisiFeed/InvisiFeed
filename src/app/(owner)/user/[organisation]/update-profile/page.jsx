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
  console.log(owner);
  const [ownerInfo, setOwnerInfo] = useState({});
  const fetchOwnerInfo = async () => {
    const response = await axios.post("/api/get-owner-info", {
      username: owner?.username, // Payload should be an object
    });
    console.log(response.data.data);
    const ownerInfo = response.data.data;
    return ownerInfo;
  };

  useEffect(() => {
    const fetchAndSetOwnerInfo = async () => {
      const ownerInfo = await fetchOwnerInfo(); // Await the fetchOwnerInfo
      setOwnerInfo(ownerInfo); // Then update the state
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
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Form handlers and states
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle profile update
    console.log("Profile updated");
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organisation Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              placeholder="Enter Organisation Name"
              className="w-full p-2 border rounded"
              disabled={true}
              defaultValue={ownerInfo.organizationName}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter Phone Number"
              className="w-full p-2 border rounded"
              defaultValue={ownerInfo.phoneNumber}
            />
          </div>

          {/* Local Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Local Address
            </label>
            <input
              type="text"
              placeholder="Enter Local Address"
              className="w-full p-2 border rounded"
              defaultValue={ownerInfo.address}
            />
          </div>

          {/* Country Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <select
              className="w-full p-2 border rounded"
              disabled={false}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              className="w-full p-2 border rounded"
              disabled={false}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <input
              type="text"
              placeholder="Enter Pincode"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Email */}
          {/* <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full p-2 border rounded"
              defaultValue={owner?.email}
              disabled
            />
          </div> */}

          {/* Username */}
          {/* <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              className="w-full p-2 border rounded"
              defaultValue={owner?.name}
            />
          </div> */}
          {/* Update Button */}
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfilePage;
