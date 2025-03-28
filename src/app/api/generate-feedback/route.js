import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);

    let prompt = `
      Overall Satisfaction: ${body.satisfactionRating}/5,
      Communication: ${body.communicationRating}/5,
      Quality of Service: ${body.qualityOfServiceRating}/5,
      Value for Money: ${body.valueForMoneyRating}/5,
      Likelihood to Recommend: ${body.recommendRating}/5,
      Overall Rating: ${body.overAllRating}/5
    `;

    // Only add user's feedback to prompt if it exists and is not empty
    if (body.feedbackContent && body.feedbackContent.trim() !== "") {
      prompt += `
      
      User's Feedback: "${body.feedbackContent}"
      
      Based on these ratings and the user's feedback, write a personal 50-word feedback in first person ("I" perspective) that sounds natural and authentic. Include specific details from their feedback while maintaining their tone and sentiment. Make it sound like a real customer sharing their experience.`;
    } else {
      prompt += `
      
      Write a personal 30-word feedback in first person ("I" perspective) based on these ratings. Make it sound natural and authentic, like a real customer sharing their experience. Include specific details about what they liked or what could be better.`;
    }

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
