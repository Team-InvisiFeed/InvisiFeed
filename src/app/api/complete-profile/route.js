import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Get request body
    const data = await request.json();

    // Validate data
    if (!data.phoneNumber || !data.address || !data.organizationName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the address has all required fields
    const { address } = data;
    if (
      !address.localAddress ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.pincode
    ) {
      return NextResponse.json(
        { success: false, message: "Missing address fields" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await OwnerModel.findByIdAndUpdate(
      session.user.id,
      {
        organizationName: data.organizationName,
        phoneNumber: data.phoneNumber,
        address: address,
        isProfileCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
