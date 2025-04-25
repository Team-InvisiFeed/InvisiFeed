import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";

export async function GET(req) {
  try {
    await dbConnect();

    // Find all users with expired Pro plans
    const now = new Date();
    const expiredUsers = await OwnerModel.find({
      "plan.planName": "pro",
      "plan.planEndDate": { $lt: now },
    });

    // Downgrade them to Free plan
    for (const user of expiredUsers) {
      user.plan = {
        planName: "free",
        planStartDate: null,
        planEndDate: null,
      };
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully downgraded ${expiredUsers.length} expired Pro plans to Free`,
    });
  } catch (error) {
    console.error("Error downgrading expired plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to downgrade expired plans",
      },
      { status: 500 }
    );
  }
} 