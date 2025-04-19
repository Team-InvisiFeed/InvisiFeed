import { NextResponse } from "next/server";
import OwnerModel from "@/models/Owner";
import InvoiceModel from "@/models/Invoice";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
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

    const invoices = await InvoiceModel.find({ owner: owner._id });

    // Extract all coupons from invoices
    const coupons = invoices
      .filter(
        (invoice) =>
          invoice?.couponAttached?.isCouponUsed === false &&
          invoice?.couponAttached?.couponExpiryDate > Date.now()
      ) // Only get invoices with coupons
      .map((invoice) => ({
        invoiceId: invoice.invoiceId,
        couponCode: invoice.couponAttached.couponCode,
        description: invoice.couponAttached.couponDescription,
        expiryDate: invoice.couponAttached.couponExpiryDate,
        isUsed: invoice.couponAttached.isCouponUsed,
      }));

    return NextResponse.json(
      {
        success: true,
        message: "Coupons fetched successfully",
        coupons,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
