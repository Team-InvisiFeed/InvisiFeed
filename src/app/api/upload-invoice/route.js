import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import dotenv from "dotenv";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";
import crypto from "crypto";

dotenv.config();

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Google Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  await dbConnect();
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const username = formData.get("username");
    const couponDataStr = formData.get("couponData");

    let couponData = null;
    if (couponDataStr) {
      couponData = JSON.parse(couponDataStr);
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check daily upload limit first
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
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

    // Check if invoice already exists
    if (!owner.invoices) {
      owner.invoices = [];
    }

    const invoiceNumber = await extractInvoiceNumberFromPdf(file);
    if (
      !invoiceNumber ||
      invoiceNumber === "Not Found" ||
      invoiceNumber === "Extraction Failed"
    ) {
      return NextResponse.json(
        { error: "Invoice number not found" },
        { status: 400 }
      );
    }

    const existedInvoice = owner.invoices.some(
      (invoice) => invoice.invoiceId === invoiceNumber
    );

    if (existedInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists" },
        { status: 400 }
      );
    }

    // If all checks pass, proceed with Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload Invoice PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "pdf_uploads",
            resource_type: "raw",
            public_id: `${file.name.split(".")[0]}_${username}_${Date.now()}`,
            format: "pdf",
          },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    const pdfUrl = uploadResult.secure_url;

    // Handle coupon data if provided
    let modifiedCouponCode = null;
    const expiryDate = new Date();
    let dbCouponCode = null;

    if (couponData) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      // Modify coupon code by adding random chars at start and invoice count
      dbCouponCode = `${couponData.couponCode}${owner.invoices.length + 1}`;
      modifiedCouponCode = `${randomChars}${couponData.couponCode}${
        owner.invoices.length + 1
      }`;

      // Calculate expiry date
      expiryDate.setDate(expiryDate.getDate() + Number(couponData.expiryDays));
    }
    // console.log(modifiedCouponCode);
    // Add new invoice with initial AIuseCount and coupon if provided
    owner.invoices.push({
      invoiceId: invoiceNumber,
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

    // Update upload counts
    owner.uploadedInvoiceCount.count += 1;
    owner.uploadedInvoiceCount.dailyUploads += 1;
    owner.uploadedInvoiceCount.lastUpdated = now;

    await owner.save();

    // Generate QR Code PDF with modified coupon code if provided
    const qrPdfBuffer = await generateQrPdf(
      invoiceNumber,
      username,
      modifiedCouponCode
    );
    const mergedPdfBuffer = await mergePdfs(pdfUrl, qrPdfBuffer);

    // Upload Final Merged PDF to Cloudinary
    const finalUpload = await new Promise((resolve, reject) => {
      const sanitiseString = (str) => {
        return str.replace(/[^a-zA-Z0-9-_\.]/g, "_");
      };

      const sanitizedInvoiceNumber = sanitiseString(invoiceNumber);
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "pdf_uploads",
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
    return NextResponse.json(
      { url: finalPdfUrl, invoiceNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function extractInvoiceNumberFromPdf(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const bytes = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(bytes);

    const result = await model.generateContent([
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
      "Extract only the invoice identifier, such as Invoice ID, Invoice No., Order ID, Customer ID, or Reference ID. The identifier may include a combination of alphanumeric characters and special symbols. Return only the identifier, excluding any additional text or formatting. If no identifier is found, return 'Not Found'.",
    ]);

    const responseText = result.response.text().trim();
    return responseText || "Not Found";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Extraction Failed";
  }
}

async function generateQrPdf(
  invoiceNumber,
  username,
  modifiedCouponCode = null
) {
  try {
    // Create QR Code buffer
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `http://localhost:3000/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;

    // Add modified coupon code to QR data if provided
    if (modifiedCouponCode) {
      qrData += `&cpcd=${modifiedCouponCode}`;
    }

    const qrBuffer = await QRCode.toBuffer(qrData, { width: 300 });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page to the PDF
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions

    // Set light cream background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      color: rgb(0.98, 0.97, 0.95), // Light cream color
    });

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    // Helper function to center text
    const centerText = (text, y, size, font) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = (page.getWidth() - textWidth) / 2;
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0.2, 0.2, 0.2), // Dark gray, almost black
      });
    };

    // Draw header
    centerText("InvisiFeed", 750, 36, helveticaBoldFont);

    // Draw subtitle
    centerText("Your Feedback Matters", 700, 20, helveticaFont);

    // Draw invoice number
    centerText(`Invoice: ${invoiceNumber}`, 650, 16, helveticaFont);

    // Draw instructions
    const instructions = [
      "Scan this QR code to provide your valuable feedback",
      "Your feedback helps us improve our services",
      "Thank you for choosing InvisiFeed!",
    ];

    instructions.forEach((text, index) => {
      centerText(text, 600 - index * 25, 14, helveticaFont);
    });

    // Embed the QR Code as an image
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const { width, height } = qrImage.scale(0.5);

    // Calculate center position for QR code
    const centerX = (page.getWidth() - width) / 2;
    const centerY = 350; // Lowered from 400 to 350 to prevent overlap with text

    // Place the QR Code image
    page.drawImage(qrImage, {
      x: centerX,
      y: centerY,
      width,
      height,
    });

    // Add clickable link below QR code
    const linkText = qrData;
    const linkTextWidth = helveticaFont.widthOfTextAtSize(linkText, 14);
    const linkX = (page.getWidth() - linkTextWidth) / 2;
    const linkY = centerY - 30; // Position below QR code

    // Draw the link text in blue to indicate it's clickable
    page.drawText(linkText, {
      x: linkX,
      y: linkY,
      size: 14,
      font: helveticaFont,
      color: rgb(0, 0, 0.8), // Blue color to indicate it's a link
    });

    // Draw footer
    centerText(
      "© 2024 InvisiFeed. All rights reserved.",
      50,
      12,
      helveticaFont
    );

    // Serialize the PDFDocument to bytes
    return await pdfDoc.save();
  } catch (error) {
    console.error("Error generating QR PDF:", error);
    throw error;
  }
}

async function mergePdfs(invoicePdfUrl, qrPdfBuffer) {
  try {
    const invoicePdfResponse = await axios.get(invoicePdfUrl, {
      responseType: "arraybuffer",
    });
    const invoicePdfBuffer = invoicePdfResponse.data;

    const invoicePdf = await PDFDocument.load(invoicePdfBuffer);
    const qrPdf = await PDFDocument.load(qrPdfBuffer);

    const mergedPdf = await PDFDocument.create();
    const [invoicePage] = await mergedPdf.copyPages(invoicePdf, [0]);
    const [qrPage] = await mergedPdf.copyPages(qrPdf, [0]);

    mergedPdf.addPage(invoicePage);
    mergedPdf.addPage(qrPage);

    return await mergedPdf.save();
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw error;
  }
}

/*

invoice+qr+1.pdf => kanha

kanha filled it submitted it. 
then feedback count ===1
and feedback page => useeffect (check feedback count) => 
  if (feedback count === 1) => show regenerate button
if (feedback count >= 2) => show "you reached the limit to give feedback"

now kanha wants to give feedback again

*/
