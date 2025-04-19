import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractInvoiceNumberFromPdf(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      });
  
      const bytes = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(bytes);
  
      const result = await model.generateContent([
        {
          inlineData: {
            data: pdfBuffer.toString("base64"),
            mimeType: "application/pdf",
          },
        },
        "Extract only the invoice identifier, such as Invoice ID, Invoice No., Order ID, Customer ID, or Reference ID. The identifier may include a combination of alphanumeric characters and special symbols. Return only the identifier, excluding any additional text or formatting. If no identifier is found, return 'Not Found'.",
      ]);
  
      const responseText = result.response.text().trim();
      return responseText || "Not Found";
    } catch (error) {
    console.error("Gemini API Error:", error);
    return "Extraction Failed";
  }
}
