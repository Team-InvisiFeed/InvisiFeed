import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      throw new ApiError(404, "Organisation not found");
    }

    // Find the invoice index
    const invoice = owner.invoices.find(
      (inv) => inv.invoiceId === decodedInvoiceNumber
    );

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    // Initialize feedbacks array if it doesn't exist
    if (!owner.feedbacks) {
      owner.feedbacks = [];
    }

    // Add the new feedback to the owner's feedbacks array
    owner.feedbacks.push({
      ...formData,
      feedbackContent: formData.feedbackContent.trim(),
      suggestionContent: formData.suggestionContent.trim(),
      createdAt: new Date()
    });

    // Set the feedback submitted flag on the specific invoice
    invoice.isFeedbackSubmitted = true;
    await owner.save();

    return Response.json(
      { message: "Feedback added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return Response.json({ message: error.message }, { status: 500 });
  }
}
