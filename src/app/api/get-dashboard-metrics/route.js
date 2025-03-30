import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { username } = await req.json();
  const decodedUsername = decodeURIComponent(username);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      throw new ApiError(404, "Organisation not found");
    }

    const feedbacks = owner.feedbacks || [];
    const invoices = owner.invoices || [];
    const totalFeedbacks = feedbacks.length;
    const totalInvoices = invoices.length;

    // Calculate feedback to invoice ratio
    const feedbackRatio =
      totalInvoices > 0 ? (totalFeedbacks / totalInvoices) * 100 : 0;

    // Calculate average overall rating
    const averageOverallRating =
      totalFeedbacks > 0
        ? feedbacks.reduce((sum, feedback) => sum + feedback.overAllRating, 0) /
          totalFeedbacks
        : 0;

    // Get historical rating data
    const historicalRatings = feedbacks
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((feedback) => ({
        date: new Date(feedback.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        rating: feedback.overAllRating,
      }));

    // Calculate positive-negative feedback ratio
    const positiveFeedbacks = feedbacks.filter(
      (feedback) => feedback.overAllRating > 2.5
    ).length;
    const negativeFeedbacks = feedbacks.filter(
      (feedback) => feedback.overAllRating <= 2.5
    ).length;
    const positiveNegativeRatio =
      negativeFeedbacks > 0
        ? positiveFeedbacks / negativeFeedbacks
        : positiveFeedbacks;

    // Calculate average ratings for each metric
    const metrics = {
      satisfactionRating: "Satisfaction",
      communicationRating: "Communication",
      qualityOfServiceRating: "Quality of Service",
      valueForMoneyRating: "Value for Money",
      recommendRating: "Recommendation",
      overAllRating: "Overall Rating",
    };

    const averageRatings = {};
    Object.keys(metrics).forEach((key) => {
      averageRatings[key] =
        totalFeedbacks > 0
          ? feedbacks.reduce((sum, feedback) => sum + feedback[key], 0) /
            totalFeedbacks
          : 0;
    });

    // Find best and worst performing metrics
    const sortedMetrics = Object.entries(averageRatings)
      .filter(([key]) => key !== "overAllRating")
      .sort(([, a], [, b]) => b - a);

    const bestPerforming = sortedMetrics[0];
    const worstPerforming = sortedMetrics[sortedMetrics.length - 1];


    return Response.json(
      {
        message: "Dashboard metrics retrieved successfully",
        data: {
          feedbackRatio: Number(feedbackRatio.toFixed(2)),
          averageOverallRating: Number(averageOverallRating.toFixed(2)),
          positiveNegativeRatio: Number(positiveNegativeRatio.toFixed(2)),
          totalFeedbacks,
          totalInvoices,
          apiMetrics: metrics,
          bestPerforming: {
            metric: metrics[bestPerforming[0]],
            rating: Number(bestPerforming[1].toFixed(2)),
          },
          worstPerforming: {
            metric: metrics[worstPerforming[0]],
            rating: Number(worstPerforming[1].toFixed(2)),
          },
          improvements: owner.currentRecommendedActions.improvements,
          strengths: owner.currentRecommendedActions.strengths,
          positiveFeedbacks,
          negativeFeedbacks,
          averageRatings: Object.fromEntries(
            Object.entries(averageRatings).map(([key, value]) => [
              key,
              Number(value.toFixed(2)),
            ])
          ),
          historicalRatings,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return Response.json({ message: error.message }, { status: 500 });
  }
}
