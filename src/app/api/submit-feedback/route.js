import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/Invoice";
import OwnerModel from "@/models/Owner";
import { NextResponse } from "next/server";
import FeedbackModel from "@/models/Feedback";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    // Find the invoice index
    const invoice = await InvoiceModel.findOne({
      invoiceId: decodedInvoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // Add the new feedback to the owner's feedbacks array

    const feedback = await FeedbackModel.create({
      ...formData,
      givenTo: owner._id,
    });

    await feedback.save();

    // Set the feedback submitted flag on the specific invoice
    invoice.isFeedbackSubmitted = true;
    await invoice.save(); 

    owner.feedbacks.push(feedback._id);
    await owner.save();

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
