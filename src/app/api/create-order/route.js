import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a pro plan
    if (user.plan?.planName === "pro") {
      return NextResponse.json(
        { success: false, message: "User already has a Pro plan" },
        { status: 400 }
      );
    }

    const { amount, currency = "INR" } = await req.json();

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
