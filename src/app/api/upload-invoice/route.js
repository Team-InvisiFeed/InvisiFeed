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

    const existedInvoice = owner.invoiceIds.some(
      (invoice) => invoice.invoiceId === invoiceNumber
    );

    if (existedInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists" },
        { status: 400 }
      );
    }

    const newInvoice = {
      invoiceId: invoiceNumber, // ✅ Ensure correct field name
      feedbackCount: 1, // ✅ Default frequency value (set as per your logic)
    };
    
    // Push the new object into invoiceIds array
    owner.invoiceIds.push(newInvoice);
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
            public_id: `invoice_with_qr_${sanitizedInvoiceNumber}`,
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
      "Extract only the invoice identifier like Invoice ID/Invoice No./ Order ID / Customer ID / Reference ID etc. Return the identifier only , no unnecessary text. If not found, return 'Not Found'.",
    ]);
    // console.log(result.response.text().trim());

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
    const url = `http://localhost:3000/feedback/${username}/${invoiceNumber}`;
    const qrData = encodeURI(url);
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 300 });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page to the PDF
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions

    // Embed the Times Roman font
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Draw the invoice text
    page.drawText(`Invoice: ${invoiceNumber}`, {
      x: 50,
      y: 800,
      size: 24,
      font: timesRomanFont,
      color: rgb(0, 0, 0), // Black color
    });

    // Embed the QR Code as an image
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const { width, height } = qrImage.scale(0.5);

    // Place the QR Code image
    page.drawImage(qrImage, {
      x: 50,
      y: 650,
      width,
      height,
    });

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
