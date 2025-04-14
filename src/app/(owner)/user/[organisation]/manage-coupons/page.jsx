"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ManageCoupons() {
  const { data: session } = useSession();
  const owner = session?.user;
  const params = useParams();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const couponsPerPage = 10;

  useEffect(() => {
    if (owner?.username) {
      fetchCoupons();
    }
  }, [owner?.username]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.post("/api/get-coupons", {
        username: owner.username,
      });
      if (response.data.error) {
        toast(response.data.error);
        return;
      }
      setCoupons(response.data.coupons);
    } catch (error) {
      toast("Failed to fetch coupons");
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    try {
      const response = await axios.post("/api/delete-coupon", {
        username: owner.username,
        invoiceId: coupon.invoiceId,
      });

      if (response.data.error) {
        toast(response.data.error);
        return;
      }

      toast("Coupon marked as used successfully");
      setCoupons(coupons.filter((c) => c.invoiceId !== coupon.invoiceId));
      setShowDeleteDialog(false);
    } catch (error) {
      toast("Failed to delete coupon");
      console.error("Error deleting coupon:", error);
    }
  };

  // Filter coupons based on search query
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      coupon.couponCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coupons, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);
  const startIndex = (currentPage - 1) * couponsPerPage;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + couponsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
          <span>Loading coupons...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Manage Coupons
          </h1>
          <p className="text-gray-400 mt-2">
            View and manage all your active coupons
          </p>
        </motion.div>

        <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400">Coupon List</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search coupon code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="pl-10 bg-[#0A0A0A] border-yellow-400/20 text-gray-300 placeholder:text-gray-500 focus:border-yellow-400/40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCoupons.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No coupons found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedCoupons.map((coupon) => (
                      <div
                        key={coupon.invoiceId}
                        className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-lg overflow-hidden hover:border-yellow-400/20 transition-colors group relative"
                      >
                        <div
                          className="p-4 cursor-pointer flex items-center justify-between"
                          onClick={() =>
                            setExpandedCoupon(
                              expandedCoupon === coupon.invoiceId
                                ? null
                                : coupon.invoiceId
                            )
                          }
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/20">
                              {coupon.couponCode}
                            </div>
                            <span className="text-gray-300">
                              Invoice: {coupon.invoiceId}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            {coupon.isUsed ? (
                              <span className="text-green-400 text-sm font-medium">
                                Used
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCouponToDelete(coupon);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <MdDelete className="w-5 h-5" />
                              </button>
                            )}
                            {expandedCoupon === coupon.invoiceId ? (
                              <IoIosArrowUp className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <IoIosArrowDown className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedCoupon === coupon.invoiceId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-yellow-400/10"
                            >
                              <div className="p-4 space-y-3">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-400">
                                    Description
                                  </h3>
                                  <p className="mt-1 text-gray-300">
                                    {coupon.description}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-400">
                                    Expiry Date
                                  </h3>
                                  <p className="mt-1 text-gray-300">
                                    {new Date(
                                      coupon.expiryDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0A0A0A] border border-yellow-400/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to mark this coupon as used? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCoupon(couponToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
