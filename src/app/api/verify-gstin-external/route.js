import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  try {
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

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error verifying GSTIN:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying GSTIN" },
      { status: 500 }
    );
  }
}
