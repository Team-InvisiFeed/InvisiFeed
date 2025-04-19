import { NextResponse } from "next/server";
import sendInvoiceToMail from "@/utils/sendInvoiceToMail";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { customerEmail, invoiceNumber, pdfUrl, companyName } =
      await req.json();

    if (!customerEmail || !invoiceNumber || !pdfUrl) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendInvoiceToMail(
      customerEmail,
      invoiceNumber,
      pdfUrl,
      companyName
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-invoice-email route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
