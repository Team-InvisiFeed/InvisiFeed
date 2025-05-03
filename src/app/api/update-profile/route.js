import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;
    const body = await req.json();
    console.log("body: ", body);

    // Find the user
    const user = await OwnerModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user fields
    if (body?.data?.organizationName) {
      user.organizationName = body?.data?.organizationName;
    }
    if (body?.data?.phoneNumber || body?.data?.phoneNumber === "") {
      user.phoneNumber = body?.data?.phoneNumber;
    }
    if (body?.data?.address) {
      user.address = body?.data?.address;
    }

    console.log("user phoneNumber: ", user.phoneNumber);
    // Check if all required fields are filled

    const hasOrganizationName =
      user.organizationName && user.organizationName.trim() !== "";
    const hasPhoneNumber = user.phoneNumber && user.phoneNumber.trim() !== "";

    const hasAddress =
      user.address &&
      user.address.localAddress &&
      user.address.localAddress.trim() !== "" &&
      user.address.city &&
      user.address.city.trim() !== "" &&
      user.address.state &&
      user.address.state.trim() !== "" &&
      user.address.country &&
      user.address.country.trim() !== "" &&
      user.address.pincode &&
      user.address.pincode.trim() !== "";

    // Update profile completion status
    if (hasOrganizationName && hasPhoneNumber && hasAddress) {
      user.isProfileCompleted = "completed";
    } else {
      user.isProfileCompleted = "skipped";
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
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
      { success: false, message: "Error updating profile" },
      { status: 500 }
    );
  }
}
