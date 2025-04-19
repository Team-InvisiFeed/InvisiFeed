import { NextResponse } from "next/server";
import OwnerModel from "@/models/Owner";
import InvoiceModel from "@/models/Invoice";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  try {
    const { username, invoiceId } = await req.json();

    if (!username || !invoiceId) {
      return NextResponse.json(
        { success: false, message: "Username and invoiceId are required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Find the invoice and update its coupon status
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      owner: owner._id,
    });
    if (!invoice || !invoice.couponAttached) {
      return NextResponse.json(
        { success: false, message: "Invoice or coupon not found" },
        { status: 404 }
      );
    }

    invoice.couponAttached.isCouponUsed = true;
    await invoice.save();

    return NextResponse.json(
      { success: true, message: "Coupon marked as used successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
