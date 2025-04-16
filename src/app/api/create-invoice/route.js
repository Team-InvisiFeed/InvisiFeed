import { NextResponse } from "next/server";
import QRCode from "qrcode";
import cloudinary from "cloudinary";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";
import crypto from "crypto";
import { generateInvoicePdf } from "@/utils/pdfGenerator";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const { username, ...invoiceData } = data;

    // Find owner
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }

    // Check daily upload limit
    const now = new Date();
    const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
    const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

    // Reset daily uploads if 24 hours have passed
    if (hoursSinceLastReset >= 24) {
      owner.uploadedInvoiceCount.dailyUploads = 0;
      owner.uploadedInvoiceCount.lastDailyReset = now;
    }

    // Check if daily limit reached
    if (owner.uploadedInvoiceCount.dailyUploads >= 3) {
      const timeLeft = 24 - hoursSinceLastReset;
      const hoursLeft = Math.ceil(timeLeft);
      return NextResponse.json(
        {
          error: `Daily upload limit reached. Please try again after ${hoursLeft} hours.`,
          timeLeft: hoursLeft,
        },
        { status: 429 }
      );
    }

    // Generate invoice number if not provided
    const invoiceNumber = invoiceData.invoiceNumber || `INV-${Date.now()}`;

    // Check if invoice number already exists
    const existedInvoice = owner.invoices.some(
      (invoice) => invoice.invoiceId === invoiceNumber
    );

    if (existedInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    // Generate QR code
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;

    // Add coupon data if provided
    let modifiedCouponCode = null;
    let dbCouponCode = null;
    const expiryDate = new Date();
    if (invoiceData.addCoupon && invoiceData.coupon) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      // Modify coupon code by adding random chars at start and invoice count
      dbCouponCode = `${invoiceData.coupon.code}${owner.invoices.length + 1}`;
      modifiedCouponCode = `${randomChars}${invoiceData.coupon.code}${owner.invoices.length + 1}`;
      expiryDate.setDate(expiryDate.getDate() + Number(invoiceData.coupon.expiryDays));

      qrData += `&cpcd=${modifiedCouponCode}`;
    }

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountTotal = invoiceData.items.reduce((sum, item) => {
      const itemDiscount = (item.amount * item.discount) / 100;
      return sum + itemDiscount;
    }, 0);
    const taxTotal = ((subtotal - discountTotal) * invoiceData.taxRate) / 100;
    const grandTotal = subtotal - discountTotal + taxTotal;

    // Generate PDF using react-pdf/renderer
    const pdfBuffer = await generateInvoicePdf(
      invoiceData,
      invoiceNumber,
      qrData,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    );

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);
      bufferStream.pipe(uploadStream);
    });

    // Save invoice to database
    owner.invoices.push({
      invoiceId: invoiceNumber,
      mergedPdfUrl: uploadResponse.secure_url,
      AIuseCount: 0,
      couponAttached: invoiceData.addCoupon
        ? {
            couponCode: dbCouponCode,
            couponDescription: invoiceData.coupon.description,
            couponExpiryDate: expiryDate,
            isCouponUsed: false,
          }
        : null,
    });

    // Update upload counts
    owner.uploadedInvoiceCount.count += 1;
    owner.uploadedInvoiceCount.dailyUploads += 1;
    owner.uploadedInvoiceCount.lastUpdated = now;

    await owner.save();

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      invoiceNumber,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
} 