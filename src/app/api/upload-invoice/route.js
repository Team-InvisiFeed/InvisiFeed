import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QRCode from "qrcode";
import { writeFile } from "fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import dotenv from "dotenv";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";

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

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload Invoice PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "pdf_uploads",
            resource_type: "raw",
            public_id: file.name.split(".")[0],
            format: "pdf",
          },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    const pdfUrl = uploadResult.secure_url;
    const invoiceNumber = await extractInvoiceNumberFromPdf(pdfUrl);

    if (!invoiceNumber || invoiceNumber === "Not Found") {
      return NextResponse.json(
        { error: "Invoice number not found" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Initialize invoices array if it doesn't exist
    if (!owner.invoices) {
      owner.invoices = [];
    }

    // Check if invoice already exists
    const existedInvoice = owner.invoices.some(
      (invoice) => invoice.invoiceId === invoiceNumber
    );

    if (existedInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists" },
        { status: 400 }
      );
    }

    // Add new invoice with initial AIuseCount
    owner.invoices.push({
      invoiceId: invoiceNumber,
      AIuseCount: 0,
    });
    await owner.save();

    // Generate QR Code PDF
    const qrPdfBuffer = await generateQrPdf(invoiceNumber, username);
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

async function extractInvoiceNumberFromPdf(pdfUrl) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(pdfBuffer).toString("base64"),
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

async function generateQrPdf(invoiceNumber, username) {
  try {
    // Create QR Code buffer
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    const qrData = `http://localhost:3000/feedback/${encodedUsername}/${encodedInvoiceNumber}`;
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
