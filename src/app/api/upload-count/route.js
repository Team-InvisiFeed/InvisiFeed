import { NextResponse } from "next/server";
import OwnerModel from "@/models/Owner";
import dbConnect from "@/lib/dbConnect";

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }

    // Calculate time remaining if daily limit is reached
    let timeLeft = null;
    const now = new Date();
    const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
    const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

    if (owner.uploadedInvoiceCount.dailyUploads >= 3) {
      timeLeft = Math.ceil(24 - hoursSinceLastReset);
    }

    return NextResponse.json({
      success: true,
      dailyUploads: owner.uploadedInvoiceCount.dailyUploads,
      timeLeft,
      dailyLimit: 3,
    });
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 