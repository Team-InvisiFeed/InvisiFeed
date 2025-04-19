import { NextResponse } from "next/server";
import axios from "axios";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gstinNumber = searchParams.get("gstinNumber");

    if (!gstinNumber) {
      return NextResponse.json(
        { success: false, message: "GSTIN number is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${process.env.GSTIN_VERIFICATION_URL}/${gstinNumber}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "GSTIN details fetched successfully",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying GSTIN:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying GSTIN" },
      { status: 500 }
    );
  }
}
