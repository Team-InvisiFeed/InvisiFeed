import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import mongoose from "mongoose";

const getAllOwners = async (req, res) => {
  await dbConnect(); // Establish a connection to the database.

  // Fetch all Owners from the database.
  const owners = await OwnerModel.find({}); // Adjust the query if filters are needed.

  // If no Owners are found, return a 404 Not Found response.
  if (!owners || owners.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No Owners found", // Message for no owners.
    });
  }

  // Return the list of Owners as a successful response.
  return res.status(200).json({
    success: true,
    owners, // Array of Owners.
  });
};

// Wrap the function with asyncHandler.
export const GET = asyncHandler(getAllOwners);
