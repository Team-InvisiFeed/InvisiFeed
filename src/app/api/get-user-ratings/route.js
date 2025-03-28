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

    // Calculate average ratings from all feedbacks
    const feedbacks = owner.feedbacks || [];
    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return Response.json(
        {
          message: "No feedbacks found for this organisation",
          data: {
            averageRatings: {
              satisfactionRating: 0,
              communicationRating: 0,
              qualityOfServiceRating: 0,
              valueForMoneyRating: 0,
              recommendRating: 0,
              overAllRating: 0,
            },
            totalFeedbacks: 0,
          },
        },
        { status: 200 }
      );
    }

    const averageRatings = {
      satisfactionRating: 0,
      communicationRating: 0,
      qualityOfServiceRating: 0,
      valueForMoneyRating: 0,
      recommendRating: 0,
      overAllRating: 0,
    };

    // Sum up all ratings
    feedbacks.forEach((feedback) => {
      averageRatings.satisfactionRating += feedback.satisfactionRating;
      averageRatings.communicationRating += feedback.communicationRating;
      averageRatings.qualityOfServiceRating += feedback.qualityOfServiceRating;
      averageRatings.valueForMoneyRating += feedback.valueForMoneyRating;
      averageRatings.recommendRating += feedback.recommendRating;
      averageRatings.overAllRating += feedback.overAllRating;
    });

    // Calculate averages
    Object.keys(averageRatings).forEach((key) => {
      averageRatings[key] = Number(
        (averageRatings[key] / totalFeedbacks).toFixed(2)
      );
    });

    return Response.json(
      {
        message: "Owner ratings retrieved successfully",
        data: {
          averageRatings,
          totalFeedbacks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
