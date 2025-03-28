import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return Response.json(
        { message: "Invoice Provider not found" },
        { status: 404 }
      );
    }

    // Initialize invoices array if it doesn't exist
    if (!owner.invoices) {
      owner.invoices = [];
    }

    // Find or create invoice entry
    let invoice = owner.invoices.find(
      (inv) => inv.invoiceId === decodedInvoiceNumber
    );

    if (!invoice) {
      invoice = {
        invoiceId: decodedInvoiceNumber,
        AIuseCount: 0,
      };
      owner.invoices.push(invoice);
      await owner.save();
    } else if (invoice && invoice.isFeedbackSubmitted) {
      return Response.json(
        { message: "Feedback already submitted" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Invoice Number and Username verified",
        owner: owner,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
