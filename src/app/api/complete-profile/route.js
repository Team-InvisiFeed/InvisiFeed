import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function PATCH(request) {
  try {
    // Connect to the database
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const username = session?.user?.username;

    // Get request body
    const data = await request.json();

    // Check if this is a "skip profile" request
    const isSkipRequest = data.skipProfile === true;

    // Determine if all fields are filled
    const hasOrganizationName =
      data.organizationName && data.organizationName.trim() !== "";
    const hasPhoneNumber = data.phoneNumber && data.phoneNumber.trim() !== "";
    const hasAddress =
      data.address &&
      data.address.localAddress &&
      data.address.localAddress.trim() !== "" &&
      data.address.city &&
      data.address.city.trim() !== "" &&
      data.address.state &&
      data.address.state.trim() !== "" &&
      data.address.country &&
      data.address.country.trim() !== "" &&
      data.address.pincode &&
      data.address.pincode.trim() !== "";

    // Set profile completion status
    let profileStatus = "pending";
    if (isSkipRequest) {
      profileStatus = "skipped";
    } else if (hasOrganizationName && hasPhoneNumber && hasAddress) {
      profileStatus = "completed";
    } else {
      profileStatus = "skipped";
    }

    // Update user profile with whatever data is provided
    const updatedUser = await OwnerModel.findOneAndUpdate(
      { username: username },
      {
        organizationName: data.organizationName || "",
        phoneNumber: data.phoneNumber || "",
        address: {
          localAddress: data.address?.localAddress || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          country: data.address?.country || "",
          pincode: data.address?.pincode || "",
        },
        isProfileCompleted: profileStatus,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: isSkipRequest
          ? "Profile completion skipped. You can complete it later."
          : profileStatus === "completed"
          ? "Profile completed successfully"
          : "Profile updated but some fields are still missing",
        profileStatus,
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
