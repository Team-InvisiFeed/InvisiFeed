import { NextResponse } from "next/server";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import asyncHandler from "@/utils/asyncHandler"; // Importing the asyncHandler utility
import { ApiResponse } from "@/utils/ApiResponse"; // Importing the ApiResponse utility

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const userClickCounts = new Map();

export const runtime = "edge";

export const POST = asyncHandler(async (request) => {
  const userIP = request.headers.get("x-forwarded-for") || "unknown";

  // Check if user exists in the map
  const userData = userClickCounts.get(userIP);

  // Rate limit check
  if (
    userData &&
    userData.count >= 3 &&
    Date.now() - userData.lastClickTime < 60 * 60 * 1000
  ) {
    const remainingTime =
      60 - Math.floor((Date.now() - userData.lastClickTime) / 60000);
    const response = new ApiResponse(
      429,
      null,
      `Rate limit exceeded. Please try again after ${remainingTime} minutes.`
    );
    return NextResponse.json(response, { status: response.statusCode });
  }

  const prompt =
    "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

  // Initialize Gemini model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite-preview-02-05",
  });

  // Fetching and parsing Gemini API response
  const result = await model.generateContent(prompt);

  if (!result || !result.response) {
    throw new Error("Invalid response from Gemini API.");
  }

  const text = await result.response.text();

  if (!text || text.trim() === "") {
    throw new Error("Empty response from Gemini API.");
  }

  const suggestions = text.split("||");

  // Update user click count
  const newCount = userData ? userData.count + 1 : 1;
  userClickCounts.set(userIP, {
    count: newCount,
    lastClickTime: Date.now(),
  });

  // Create success response
  const response = new ApiResponse(200, { suggestions });
  return NextResponse.json(response, { status: response.statusCode });
});
