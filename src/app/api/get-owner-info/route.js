import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  const { username } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Organisation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Owner information retrieved successfully",
        data: owner,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
