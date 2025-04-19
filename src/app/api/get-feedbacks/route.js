import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import FeedbackModel from "@/models/Feedback";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  const { username, page = 1, limit = 5, sortBy = "newest" } = await req.json();
  const decodedUsername = decodeURIComponent(username);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const totalFeedbacks = feedbacks.length;
    const totalPages = Math.ceil(totalFeedbacks / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Sort feedbacks based on the sortBy parameter
    let sortedFeedbacks = [...feedbacks];
    switch (sortBy) {
      case "newest":
        sortedFeedbacks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        sortedFeedbacks.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "highest":
        sortedFeedbacks.sort((a, b) => b.overAllRating - a.overAllRating);
        break;
      case "lowest":
        sortedFeedbacks.sort((a, b) => a.overAllRating - b.overAllRating);
        break;
      default:
        // Default to newest first
        sortedFeedbacks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    const paginatedFeedbacks = sortedFeedbacks.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        success: true,
        message: "Feedbacks retrieved successfully",
        data: {
          feedbacks: paginatedFeedbacks,
          totalFeedbacks,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
