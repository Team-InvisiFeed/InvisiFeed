import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "@/utils/ApiError";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Generate AI insights for improvements and strengths
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });

    const ratingsPrompt = `
      Satisfaction: ${averageRatings.satisfactionRating}/5,
      Communication: ${averageRatings.communicationRating}/5,
      Quality of Service: ${averageRatings.qualityOfServiceRating}/5,
      Value for Money: ${averageRatings.valueForMoneyRating}/5,
      Recommendation: ${averageRatings.recommendRating}/5,
      Overall Rating: ${averageRatings.overAllRating}/5
    `;

    // Generate improvement suggestions
    const improvementsPrompt = `${ratingsPrompt}\n\nBased on these ratings, provide exactly 3 specific, actionable improvement points. Each point should be a single line without any special characters or formatting. Focus on areas with lower ratings. Keep each point concise and practical.`;
    const improvementsResult = await model.generateContent(improvementsPrompt);
    const improvements = improvementsResult.response
      .text()
      .split("\n")
      .filter((point) => point.trim())
      .map((point) => point.replace(/[*#\-•]/g, "").trim())
      .slice(0, 3);

    // Generate strengths
    const strengthsPrompt = `${ratingsPrompt}\n\nBased on these ratings, provide exactly 3 key strengths. Each point should be a single line without any special characters or formatting. Focus on areas with higher ratings. Keep each point concise and impactful.`;
    const strengthsResult = await model.generateContent(strengthsPrompt);
    const strengths = strengthsResult.response
      .text()
      .split("\n")
      .filter((point) => point.trim())
      .map((point) => point.replace(/[*#\-•]/g, "").trim())
      .slice(0, 3);

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
          positiveFeedbacks,
          negativeFeedbacks,
          improvements,
          strengths,
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
