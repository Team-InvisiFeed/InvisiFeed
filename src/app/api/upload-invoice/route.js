import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import OwnerModel from "@/models/Owner";
import dbConnect from "@/lib/dbConnect";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extractInvoiceNumber";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generateQRpdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/mergePdfs";
import InvoiceModel from "@/models/Invoice";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate coupon data against schema
function validateCouponData(couponData) {
  if (!couponData) return null;

  // Required fields validation
  if (!couponData.couponCode || typeof couponData.couponCode !== "string") {
    throw new Error("Invalid coupon code format");
  }

  if (!couponData.description || typeof couponData.description !== "string") {
    throw new Error("Invalid coupon description format");
  }

  // Length validations
  if (couponData.couponCode.length < 3 || couponData.couponCode.length > 10) {
    throw new Error("Coupon code must be between 3 and 10 characters");
  }

  if (
    couponData.description.length < 10 ||
    couponData.description.length > 200
  ) {
    throw new Error("Coupon description must be between 10 and 200 characters");
  }

  // Expiry days validation
  if (couponData.expiryDays < 1 || couponData.expiryDays > 365) {
    throw new Error("Expiry days must be between 1 and 365");
  }

  // Format validations
  if (!/^[A-Z0-9]+$/.test(couponData.couponCode)) {
    throw new Error(
      "Coupon code must contain only uppercase letters and numbers"
    );
  }

  return true;
}

export async function POST(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const username = session?.user?.username;
    const couponDataStr = formData.get("couponData");

    let couponData = null;
    if (couponDataStr) {
      try {
        couponData = JSON.parse(couponDataStr);
        // Validate coupon data against schema
        validateCouponData(couponData);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: `Invalid coupon data: ${error.message}` },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check owner exists or not
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
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
          success: false,
          message: `Daily upload limit reached. Please try again after ${hoursLeft} hours.`,
          timeLeft: hoursLeft,
        },
        { status: 429 }
      );
    }

    const invoiceNumber = await extractInvoiceNumberFromPdf(file);
    if (
      !invoiceNumber ||
      invoiceNumber === "Not Found" ||
      invoiceNumber === "Extraction Failed"
    ) {
      return NextResponse.json(
        { success: false, message: "Invoice number not found" },
        { status: 400 }
      );
    }

    const existedInvoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (existedInvoice) {
      return NextResponse.json(
        { success: false, message: "Invoice already exists" },
        { status: 400 }
      );
    }

    // If all checks pass, proceed with Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Handle coupon data if provided
    let modifiedCouponCodeforURL = null;
    const expiryDate = new Date();
    let dbCouponCode = null;

    if (couponData) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      console.log("INVOICE COUNT", await InvoiceModel.countDocuments({}));

      // Modify coupon code by adding random chars at start and invoice count
      dbCouponCode = `${couponData.couponCode}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;
      modifiedCouponCodeforURL = `${randomChars}${couponData.couponCode}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;

      // Calculate expiry date
      expiryDate.setDate(expiryDate.getDate() + Number(couponData.expiryDays));
    }

    // Generate QR Code PDF with modified coupon code if provided
    const qrPdfBuffer = await generateQrPdf(
      invoiceNumber,
      username,
      modifiedCouponCodeforURL,
      owner
    );
    const mergedPdfBuffer = await mergePdfs(buffer, qrPdfBuffer);

    // Upload Final Merged PDF to Cloudinary
    const finalUpload = await new Promise((resolve, reject) => {
      const sanitiseString = (str) => {
        return str.replace(/[^a-zA-Z0-9-_\.]/g, "_");
      };

      const sanitizedInvoiceNumber = sanitiseString(invoiceNumber);
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "invoice_pdf_uploads",
            resource_type: "raw",
            public_id: `invoice_${sanitizedInvoiceNumber}_${username}_${Date.now()}`,
            format: "pdf",
            context: "ttl=20",
          },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(mergedPdfBuffer);
    });

    const finalPdfUrl = finalUpload.secure_url;

    // Add new invoice with initial AIuseCount, coupon if provided, and PDF URLs
    console.log("DB COUPON CODE", dbCouponCode);
    const newInvoice = new InvoiceModel({
      invoiceId: invoiceNumber,
      owner: owner._id,
      mergedPdfUrl: finalPdfUrl,
      AIuseCount: 0,
      couponAttached: couponData
        ? {
            couponCode: dbCouponCode,
            couponDescription: couponData.description,
            couponExpiryDate: expiryDate,
            isCouponUsed: false,
          }
        : null,
    });

    await newInvoice.save();

    // Update upload counts
    owner.uploadedInvoiceCount.count += 1;
    owner.uploadedInvoiceCount.dailyUploads += 1;
    owner.uploadedInvoiceCount.lastUpdated = now;

    await owner.save();

    return NextResponse.json(
      {
        success: true,
        message: "Invoice uploaded successfully",
        url: finalPdfUrl,
        invoiceNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
