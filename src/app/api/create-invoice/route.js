import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import cloudinary from "cloudinary";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";
import crypto from "crypto";

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
      modifiedCouponCode = `${randomChars}${invoiceData.coupon.code}${
        owner.invoices.length + 1
      }`;
      expiryDate.setDate(expiryDate.getDate() + Number(invoiceData.coupon.expiryDays));

      qrData += `&cpcd=${modifiedCouponCode}`;
    }

    const qrBuffer = await QRCode.toBuffer(qrData, { width: 300 });

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountTotal = invoiceData.items.reduce((sum, item) => {
      const itemDiscount = (item.amount * item.discount) / 100;
      return sum + itemDiscount;
    }, 0);
    const taxTotal = ((subtotal - discountTotal) * invoiceData.taxRate) / 100;
    const grandTotal = subtotal - discountTotal + taxTotal;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper function to draw text
    const drawText = (text, x, y, size, font, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color,
      });
    };

    // Helper function to draw line
    const drawLine = (x1, y1, x2, y2, color = rgb(0.8, 0.8, 0.8)) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        color,
        thickness: 1,
      });
    };

    // Header
    drawText("INVOICE", 50, 750, 24, helveticaBoldFont);
    drawText(`Invoice #: ${invoiceNumber}`, 50, 720, 12, helveticaFont);
    drawText(`Date: ${invoiceData.invoiceDate}`, 50, 700, 12, helveticaFont);
    if (invoiceData.dueDate) {
      drawText(`Due Date: ${invoiceData.dueDate}`, 50, 680, 12, helveticaFont);
    }
    drawText(`Payment Terms: ${invoiceData.paymentTerms}`, 50, 660, 12, helveticaFont);

    // Business Details
    drawText("From:", 50, 620, 12, helveticaBoldFont);
    drawText(invoiceData.businessName, 50, 600, 12, helveticaFont);
    drawText(invoiceData.businessEmail, 50, 580, 12, helveticaFont);
    if (invoiceData.businessPhone) {
      drawText(invoiceData.businessPhone, 50, 560, 12, helveticaFont);
    }
    const businessAddressLines = invoiceData.businessAddress.split("\n");
    businessAddressLines.forEach((line, index) => {
      drawText(line, 50, 540 - index * 20, 12, helveticaFont);
    });

    // Customer Details
    drawText("To:", 300, 620, 12, helveticaBoldFont);
    drawText(invoiceData.customerName, 300, 600, 12, helveticaFont);
    drawText(invoiceData.customerEmail, 300, 580, 12, helveticaFont);
    if (invoiceData.customerPhone) {
      drawText(invoiceData.customerPhone, 300, 560, 12, helveticaFont);
    }
    const customerAddressLines = invoiceData.customerAddress.split("\n");
    customerAddressLines.forEach((line, index) => {
      drawText(line, 300, 540 - index * 20, 12, helveticaFont);
    });

    // Items Table Header
    const tableTop = 480;
    drawLine(50, tableTop, 545, tableTop);
    drawText("Description", 50, tableTop - 15, 10, helveticaBoldFont);
    drawText("Quantity", 250, tableTop - 15, 10, helveticaBoldFont);
    drawText("Rate", 320, tableTop - 15, 10, helveticaBoldFont);
    drawText("Amount", 390, tableTop - 15, 10, helveticaBoldFont);
    drawText("Discount", 460, tableTop - 15, 10, helveticaBoldFont);

    // Items Table
    let currentY = tableTop - 40;
    invoiceData.items.forEach((item) => {
      drawText(item.description, 50, currentY, 10, helveticaFont);
      drawText(item.quantity.toString(), 250, currentY, 10, helveticaFont);
      drawText(`${item.rate.toFixed(2)}`, 320, currentY, 10, helveticaFont);
      drawText(`${item.amount.toFixed(2)}`, 390, currentY, 10, helveticaFont);
      drawText(`${item.discount}%`, 460, currentY, 10, helveticaFont);

      currentY -= 30;
    });

    // Totals
    currentY -= 20;
    drawLine(50, currentY, 545, currentY);
    drawText("Subtotal:", 390, currentY - 15, 10, helveticaBoldFont);
    drawText(`${subtotal.toFixed(2)}`, 460, currentY - 15, 10, helveticaFont);

    currentY -= 30;
    drawText("Discount:", 390, currentY - 15, 10, helveticaBoldFont);
    drawText(`-${discountTotal.toFixed(2)}`, 460, currentY - 15, 10, helveticaFont);

    currentY -= 30;
    drawText("Tax:", 390, currentY - 15, 10, helveticaBoldFont);
    drawText(`${taxTotal.toFixed(2)}`, 460, currentY - 15, 10, helveticaFont);

    currentY -= 30;
    drawLine(50, currentY, 545, currentY);
    drawText("Grand Total:", 390, currentY - 15, 12, helveticaBoldFont);
    drawText(`${grandTotal.toFixed(2)}`, 460, currentY - 15, 12, helveticaBoldFont);

    // Payment Information
    currentY -= 60;
    drawText("Payment Information", 50, currentY, 12, helveticaBoldFont);
    if (invoiceData.bankDetails) {
      currentY -= 20;
      drawText(`Bank Details / UPI ID: ${invoiceData.bankDetails}`, 50, currentY, 10, helveticaFont);
    }
    if (invoiceData.paymentMethod) {
      currentY -= 20;
      drawText(`Payment Method: ${invoiceData.paymentMethod}`, 50, currentY, 10, helveticaFont);
    }
    if (invoiceData.paymentInstructions) {
      currentY -= 20;
      drawText("Payment Instructions:", 50, currentY, 10, helveticaBoldFont);
      currentY -= 20;
      const instructions = invoiceData.paymentInstructions.split("\n");
      instructions.forEach((line) => {
        drawText(line, 50, currentY, 10, helveticaFont);
        currentY -= 20;
      });
    }

    // Notes
    if (invoiceData.notes) {
      currentY -= 20;
      drawText("Notes:", 50, currentY, 10, helveticaBoldFont);
      currentY -= 20;
      const notes = invoiceData.notes.split("\n");
      notes.forEach((line) => {
        drawText(line, 50, currentY, 10, helveticaFont);
        currentY -= 20;
      });
    }

    // QR Code
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const { width, height } = qrImage.scale(0.5);
    page.drawImage(qrImage, {
      x: 50,
      y: 50,
      width,
      height,
    });

    // Feedback Form Section (if requested)
    if (invoiceData.includeFeedbackForm) {
      // Draw a separator line
      drawLine(50, 200, 545, 200, rgb(0.9, 0.9, 0.9));

      // Header
      drawText("InvisiFeed", 50, 180, 16, helveticaBoldFont, rgb(1, 0.843, 0));
      drawText("Your Feedback Matters", 50, 160, 12, helveticaFont);

      // Instructions
      const instructions = [
        "Scan the QR code above or click the link below to share your valuable feedback.",
        "Your insights help us deliver exceptional service.",
        "Thank you for choosing InvisiFeed!",
      ];

      instructions.forEach((text, index) => {
        drawText(text, 50, 140 - index * 20, 10, helveticaFont);
      });

      // Link
      drawText("Or click the link below:", 50, 80, 10, helveticaFont);
      drawText(qrData, 50, 60, 8, helveticaFont, rgb(0, 0, 0.8));

      // Coupon Section
      if (invoiceData.addCoupon && invoiceData.coupon) {
        // Draw a coupon box
        page.drawRectangle({
          x: 50,
          y: 30,
          width: 495,
          height: 20,
          color: rgb(0.95, 0.95, 0.95),
          borderColor: rgb(1, 0.843, 0),
          borderWidth: 1,
        });

        drawText("WIN EXCLUSIVE COUPONS! Complete the feedback form for a chance to win special discounts", 55, 35, 8, helveticaBoldFont, rgb(1, 0.843, 0));
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

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

      const buffer = Buffer.from(pdfBytes);
      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
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