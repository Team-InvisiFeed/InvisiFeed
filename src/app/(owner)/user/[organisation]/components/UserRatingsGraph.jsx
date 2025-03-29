"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

export default function UserRatingsGraph() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.post(`/api/get-user-ratings`, {
          username: owner.username,
        });
        setRatings(response.data.data);
      } catch (error) {
        setError("Failed to fetch ratings");
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (owner?.username) {
      fetchRatings();
    }
  }, [owner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading ratings...</span>
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

  if (!ratings || ratings.totalFeedbacks === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            No Ratings Found
          </h2>
          <p className="text-gray-400">
            This organisation hasn't received any ratings yet.
          </p>
        </div>
      </div>
    );
  }

  const ratingLabels = {
    satisfactionRating: "Satisfaction",
    communicationRating: "Communication",
    qualityOfServiceRating: "Quality of Service",
    valueForMoneyRating: "Value for Money",
    recommendRating: "Recommendation",
    overAllRating: "Overall Rating",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-6 sm:py-12 px-3 sm:px-4">
      <Card className="w-full max-w-4xl mx-auto bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20">
        <CardHeader className="border-b border-yellow-400/20 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400">
            Average Ratings for {owner.organizationName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {Object.entries(ratingLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-yellow-400 font-semibold">
                    {ratings.averageRatings[key].toFixed(1)}/5
                  </span>
                </div>
                <Progress
                  value={(ratings.averageRatings[key] / 5) * 100}
                  className="h-2 bg-gray-800"
                />
              </div>
            ))}
            <div className="mt-6 pt-4 border-t border-yellow-400/20">
              <p className="text-gray-400 text-center">
                Based on {ratings.totalFeedbacks} feedback
                {ratings.totalFeedbacks !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
