import { NextResponse } from "next/server";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  try {
    const { username, invoiceId } = await req.json();

    if (!username || !invoiceId) {
      return NextResponse.json(
        { error: "Username and invoiceId are required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Find the invoice and update its coupon status
    const invoice = owner.invoices.find((inv) => inv.invoiceId === invoiceId);
    if (!invoice || !invoice.couponAttached) {
      return NextResponse.json(
        { error: "Invoice or coupon not found" },
        { status: 404 }
      );
    }

    invoice.couponAttached.isCouponUsed = true;
    await owner.save();

    return NextResponse.json(
      { message: "Coupon marked as used successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
