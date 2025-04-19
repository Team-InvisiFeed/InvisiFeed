import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import InvoiceModel from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  const { username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Invoice Provider not found" },
        { status: 404 }
      );
    }

    // Find or create invoice entry
    let invoice = await InvoiceModel.findOne({
      invoiceId: decodedInvoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      invoice = await InvoiceModel.create({
        invoiceId: decodedInvoiceNumber,
        AIuseCount: 0,
      });

      await invoice.save();

    } else if (invoice && invoice.isFeedbackSubmitted) {
      return NextResponse.json(
        { success: false, message: "Feedback already submitted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invoice Number and Username verified",
        data: { owner, invoice },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
