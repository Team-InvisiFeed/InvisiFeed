import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const RatingDisplay = ({ rating, label }) => (
  <div className="flex items-center space-x-2">
    <span className="text-gray-400">{label}:</span>
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  </div>
);

const CustomerFeedbacks = () => {
  const params = useParams();
  const { organisation } = params;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchFeedbacks = async (page) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/get-feedbacks", {
        username: organisation,
        page,
        limit: 5,
      });

      const { data } = response.data;
      setFeedbacks(data.feedbacks);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedbacks");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [currentPage, organisation]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading feedbacks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
          Customer Feedbacks
        </h2>

        {feedbacks.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400">No feedbacks available yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-yellow-400">
                          {format(
                            new Date(feedback.createdAt),
                            "MMM dd, yyyy hh:mm a"
                          )}{" "}
                          IST
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RatingDisplay
                          rating={feedback.satisfactionRating}
                          label="Satisfaction"
                        />
                        <RatingDisplay
                          rating={feedback.communicationRating}
                          label="Communication"
                        />
                        <RatingDisplay
                          rating={feedback.qualityOfServiceRating}
                          label="Quality"
                        />
                        <RatingDisplay
                          rating={feedback.valueForMoneyRating}
                          label="Value"
                        />
                        <RatingDisplay
                          rating={feedback.recommendRating}
                          label="Recommendation"
                        />
                        <RatingDisplay
                          rating={feedback.overAllRating}
                          label="Overall"
                        />
                      </div>

                      {feedback.feedbackContent && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Feedback
                          </h3>
                          <p className="text-gray-300">
                            {feedback.feedbackContent}
                          </p>
                        </div>
                      )}

                      {feedback.suggestionContent && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Suggestions
                          </h3>
                          <p className="text-gray-300">
                            {feedback.suggestionContent}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="border-yellow-400/20 bg-yellow-400 text-white hover:bg-yellow-400/10"
              >
                <ChevronLeft className="w-4 h-4 m-1" />
              </Button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="border-yellow-400/20 bg-yellow-400 text-white hover:bg-yellow-400/10"
              >
                <ChevronRight className="w-4 h-4 m-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedbacks;
