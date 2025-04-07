import sendVerificationEmail from "@/utils/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();

  try {
    const {
      organizationName,
      email,
      username,
      password,
    } = await req.json();

    const existingUserVerifiedByUsername = await OwnerModel.findOne({
      username,
      isVerified: true, // Sirf wo users jo pehle se verified hain
    });

    // Agar username already kisi verified user ke paas hai toh error return kar do
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists.",
        },
        {
          status: 400, // Bad Request
        }
      );
    }

    const existingUserByEmail = await OwnerModel.findOne({ email });

    // Random 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Email already exists",
          }),
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new OwnerModel({
        organizationName,
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        phoneNumber: "",
        address: {
          localAddress: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        feedbacks: [],
        invoices: [],
        isProfileCompleted: "pending",
      });

      await newUser.save();
    }

    // ✅ Send OTP Email
    const emailResponse = await sendVerificationEmail(email, verifyCode);

    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: emailResponse.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully. Please verify your email.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Error registering user",
      }),
      { status: 500 }
    );
  }
}
