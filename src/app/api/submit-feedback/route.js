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

    // Initialize invoices array if it doesn't exist
    if (!owner.invoices) {
      owner.invoices = [];
    }

    // Find the invoice
    const invoice = owner.invoices.find(
      (inv) => inv.invoiceId === decodedInvoiceNumber
    );

    if (invoice) {
      // Add feedback to the invoice
      if (!invoice.feedbacks) {
        invoice.feedbacks = [];
      }
      invoice.feedbacks.push(formData);
      await owner.save();
    } else {
      throw new ApiError(404, "Invoice not found");
    }

    return Response.json(
      { message: "Feedback added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
