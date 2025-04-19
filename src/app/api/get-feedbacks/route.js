import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import FeedbackModel from "@/models/Feedback";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const username = session?.user?.username;

    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit"));
    const sortBy = searchParams.get("sortBy");

    const owner = await OwnerModel.findOne({ username });

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
