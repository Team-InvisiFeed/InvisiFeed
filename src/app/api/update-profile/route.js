import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // Find the user
    const user = await OwnerModel.findOne({ username: body.username });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user fields
    if (body.data.organizationName) {
      user.organizationName = body.data.organizationName;
    }
    if (body.data.phoneNumber) {
      user.phoneNumber = body.data.phoneNumber;
    }
    if (body.data.address) {
      user.address = body.data.address;
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return success response
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          organizationName: user.organizationName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          isProfileCompleted: user.isProfileCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}
