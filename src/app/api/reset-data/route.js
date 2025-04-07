import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(request) {
  try {
    await dbConnect();
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Reset data
    owner.currentRecommendedActions = {
      improvements: [],
      strengths: [],
    };
    owner.feedbacks = [];
    owner.invoices = [];

    await owner.save();

    return NextResponse.json({
      success: true,
      message: "Data reset successfully",
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
