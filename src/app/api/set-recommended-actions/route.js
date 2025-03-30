import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const totalFeedbacks = feedbacks.length;

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
    // yaha se dekhna hai

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

    owner.currentRecommendedActions.improvements = improvements;
    owner.currentRecommendedActions.strengths = strengths;
    await owner.save();

    // khatam
    return Response.json(
      { message: "Recommended actions set successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error setting recommended actions:", error);
    return Response.json({ message: error.message }, { status: 500 });
  }
}
