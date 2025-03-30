import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

// Constants
const METRICS = {
  satisfactionRating: "Satisfaction",
  communicationRating: "Communication",
  qualityOfServiceRating: "Quality of Service",
  valueForMoneyRating: "Value for Money",
  recommendRating: "Recommendation",
  overAllRating: "Overall Rating",
};

// Helper functions
const calculateAverageRatings = (feedbacks, totalFeedbacks) => {
  if (!totalFeedbacks)
    return Object.fromEntries(Object.keys(METRICS).map((key) => [key, 0]));

  return Object.fromEntries(
    Object.keys(METRICS).map((key) => [
      key,
      Number(
        (
          feedbacks.reduce((sum, feedback) => sum + (feedback[key] || 0), 0) /
          totalFeedbacks
        ).toFixed(2)
      ),
    ])
  );
};

const getPerformanceMetrics = (averageRatings) => {
  const metricsArray = Object.entries(averageRatings)
    .filter(([key]) => key !== "overAllRating")
    .sort(([, a], [, b]) => b - a);

  return {
    best: {
      metric: METRICS[metricsArray[0][0]],
      rating: metricsArray[0][1],
    },
    worst: {
      metric: METRICS[metricsArray[metricsArray.length - 1][0]],
      rating: metricsArray[metricsArray.length - 1][1],
    },
  };
};

export async function POST(req) {
  try {
    await dbConnect();

    // Input validation
    const body = await req.json();
    if (!body?.username) {
      throw new ApiError(400, "Username is required");
    }

    const decodedUsername = decodeURIComponent(body.username);

    // Optimize database query
    const owner = await OwnerModel.findOne({ username: decodedUsername })
      .select("feedbacks invoices currentRecommendedActions")
      .lean();

    if (!owner) {
      throw new ApiError(404, "Organisation not found");
    }

    const feedbacks = owner.feedbacks || [];
    const invoices = owner.invoices || [];
    const totalFeedbacks = feedbacks.length;
    const totalInvoices = invoices.length;

    // Calculate metrics
    const feedbackRatio = Number(
      ((totalFeedbacks / totalInvoices) * 100 || 0).toFixed(2)
    );
    const averageRatings = calculateAverageRatings(feedbacks, totalFeedbacks);
    const { best: bestPerforming, worst: worstPerforming } =
      getPerformanceMetrics(averageRatings);

    // Calculate feedback sentiment
    const positiveFeedbacks = feedbacks.filter(
      (f) => f.overAllRating > 2.5
    ).length;
    const negativeFeedbacks = totalFeedbacks - positiveFeedbacks;
    const positivePercentage = Number(
      ((positiveFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );
    const negativePercentage = Number(
      ((negativeFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );

    // Get historical data
    const historicalRatings = feedbacks
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((feedback) => ({
        date: new Date(feedback.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        rating: feedback.overAllRating,
      }));

    return Response.json(
      {
        message: "Dashboard metrics retrieved successfully",
        data: {
          feedbackRatio,
          averageOverallRating: averageRatings.overAllRating,
          totalFeedbacks,
          totalInvoices,
          apiMetrics: METRICS,
          bestPerforming,
          worstPerforming,
          improvements: owner.currentRecommendedActions?.improvements || [],
          strengths: owner.currentRecommendedActions?.strengths || [],
          positivePercentage,
          positiveFeedbacks,
          negativeFeedbacks,
          averageRatings,
          negativePercentage,
          historicalRatings,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return Response.json(
      {
        message: error.message || "Internal server error",
        success: false,
      },
      { status }
    );
  }
}
