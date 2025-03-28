import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);
  // console.log(decodedUsername);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);
  // console.log(decodedInvoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      throw new ApiError(404, "Organisation not found");
    }

    // Initialize feedbacks array if it doesn't exist
    if (!owner.feedbacks) {
      owner.feedbacks = [];
    }

    // Find the invoice index
    const invoiceIndex = owner.invoices.findIndex(
      (inv) => inv.invoiceId === decodedInvoiceNumber
    );

    if (invoiceIndex === -1) {
      throw new ApiError(404, "Invoice not found");
    }

    // Add the new feedback to the top-level feedbacks array
    owner.feedbacks.push({
      ...formData,
      createdAt: new Date(),
    });

    // Remove the invoice from the invoices array
    owner.invoices.splice(invoiceIndex, 1);

    // Save the changes
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
