import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);

    const prompt = `
      Overall Satisfaction: ${body.satisfactionRating}/5,
      Communication: ${body.communicationRating}/5,
      Quality of Service: ${body.qualityOfServiceRating}/5,
      Value for Money: ${body.valueForMoneyRating}/5,
      Likelihood to Recommend: ${body.recommendRating}/5.
      Overall Rating: ${body.overAllRating}/5
      
      Based on these ratings, generate a professional 30-word feedback(no need to mention the numbers).
    `;
    console.log(prompt);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return Response.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return Response.json(
      { message: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
