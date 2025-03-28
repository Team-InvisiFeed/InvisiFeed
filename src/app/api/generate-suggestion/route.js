import { GoogleGenerativeAI } from "@google/generative-ai";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);

    // Connect to database
    await dbConnect();

    // Find the owner and check AI usage count
    const owner = await OwnerModel.findOne({
      username: body.username,
      "invoices.invoiceId": body.invoiceNumber,
    });

    if (!owner) {
      return Response.json(
        { message: "Owner or invoice not found" },
        { status: 404 }
      );
    }

    const invoice = owner.invoices.find(
      (inv) => inv.invoiceId === body.invoiceNumber
    );

    if (invoice.AIuseCount >= 3) {
      return Response.json(
        { message: "AI usage limit reached for this invoice" },
        { status: 429 }
      );
    }

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
      
      Based on these ratings and the user's feedback, generate a constructive 30-word suggestion for improvement. Focus on specific, actionable points that could enhance their experience. Keep the tone positive and solution-oriented.`;
    } else {
      prompt += `
      
      Based on these ratings, generate a constructive 20-word suggestion for improvement. Focus on the areas with lower ratings and provide specific, actionable advice. Keep the tone positive and solution-oriented.`;
    }

    console.log(prompt);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });
    const result = await model.generateContent(prompt);
    console.log("result : ", result.response.text());

    const suggestion = result.response.text();

    // Update AI usage count
    invoice.AIuseCount += 1;
    await owner.save();

    return Response.json({ data: { suggestion } });
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return Response.json(
      { message: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
