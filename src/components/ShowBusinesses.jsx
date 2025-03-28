import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Building2, Mail, MapPin, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function ShowBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  const getBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/get-businesses");
      if (response.data && response.data.data) {
        setBusinesses(response.data.data);
        setFilteredBusinesses(response.data.data);
      } else {
        console.error("Unexpected API response structure:", response.data);
        toast.error("Failed to load businesses");
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
      toast.error("Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getBusinesses();
  }, [getBusinesses]);

  useEffect(() => {
    const filtered = businesses.filter((business) =>
      business.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [searchQuery, businesses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading businesses...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">
            Top Rated Businesses
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover and connect with the best businesses in your area. Each business is verified and rated by our community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search businesses by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-6 bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20 rounded-xl"
            />
          </div>
        </div>

        {/* Business Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business, index) => (
              <motion.div
                key={business._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-[#0A0A0A]/30 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/5"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-medium">4.8</span>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-400/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 group-hover:text-yellow-400 transition-colors duration-300">
                    {business.organizationName}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{business.email}</span>
                  </div>

                  {business.address && (
                    <div className="flex items-center space-x-3 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {business.address.city}, {business.address.state}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-yellow-400/10">
                  <button className="w-full py-2 px-4 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2">
                    <span>View Details</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <div className="bg-[#0A0A0A]/30 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-8">
                <Building2 className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  No Businesses Found
                </h3>
                <p className="text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Please check back later for new businesses"}
                </p>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ShowBusinesses;
