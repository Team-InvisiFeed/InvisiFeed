import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { z } from "zod";
import { usernameValidation } from "@/schemas/registerSchema";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const queryParam = {
      username: searchParams.get("username"),
    };

    // Validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await OwnerModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Username is available" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return NextResponse.json(
      { success: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
