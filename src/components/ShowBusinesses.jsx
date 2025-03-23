import React from "react";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
function ShowBusinesses() {
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
  );
}

export default ShowBusinesses;
