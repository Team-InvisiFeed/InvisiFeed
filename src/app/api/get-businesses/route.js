import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import mongoose from "mongoose";
import { asyncHandler } from "@/utils/asyncHandler";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  await dbConnect(); // Establish a connection to the database.

  // Fetch all Owners from the database.
  const owners = await OwnerModel.find({}); // Adjust the query if filters are needed.

  // If no Owners are found, return a 404 Not Found response.
  if (!owners || owners.length === 0) {
    throw new ApiError(404, "No Owners found");
  }

  // Return the list of Owners as a successful response.
  return NextResponse.json(
    new ApiResponse(200, owners, "Owners retrieved successfully"),
    { status: 200 }
  );
}
