import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QRCode from "qrcode";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToStream,
} from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";
import crypto from "crypto";

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  companyInfo: {
    textAlign: "center",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  orgInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  companyTagline: {
    fontSize: 14,
    color: "#6b7280",
    alignSelf: "center",
  },
  invoiceDetails: {
    marginTop: 20,
    marginBottom: 20,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  invoiceDate: {
    marginTop: 5,
    fontSize: 12,
    color: "#555",
  },
  body: {
    marginVertical: 20,
  },
  textCenter: {
    textAlign: "center",
    marginVertical: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#4b5563",
  },
  infoTextBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  link: {
    color: "#1a56db",
    textDecoration: "underline",
    marginTop: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  feedbackSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #eaeaea",
    textAlign: "center",
  },
  couponHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 12,
    color: "#4b5563",
    display: "flex",
    gap: 4,
  },
  disclaimer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#fff1f2",
    borderRadius: 4,
    border: "1px solid #fecdd3",
  },
  disclaimerText: {
    fontSize: 7,
    color: "#881337",
    textAlign: "center",
    lineHeight: 1.5,
  },
  createdWith: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },
  createdWithSpan: {
    color: "#4f46e5",
    fontWeight: "semibold",
  },
  discFooter: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
  },
});

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Google Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const formData = await req.formData();
    const file = formData.get("file");
    const username = formData.get("username");
    const couponDataStr = formData.get("couponData");

    let couponData = null;
    if (couponDataStr) {
      try {
        couponData = JSON.parse(couponDataStr);
        // Validate coupon data against schema
        validateCouponData(couponData);
      } catch (error) {
        return NextResponse.json(
          { error: `Invalid coupon data: ${error.message}` },
          { status: 400 }
        );
      }
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

    // Generate QR Code PDF with modified coupon code if provided
    const qrPdfBuffer = await generateQrPdf(
      invoiceNumber,
      username,
      modifiedCouponCode,
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
    owner.invoices.push({
      invoiceId: invoiceNumber,
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

    // Update upload counts
    owner.uploadedInvoiceCount.count += 1;
    owner.uploadedInvoiceCount.dailyUploads += 1;
    owner.uploadedInvoiceCount.lastUpdated = now;

    await owner.save();

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
  modifiedCouponCode = null,
  owner
) {
  try {
    // Generate QR code data URL
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, { width: 300 });
    if(modifiedCouponCode){
      qrData += `&cpcd=${modifiedCouponCode.trim()}`;
    }
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create PDF document
    const QrDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={[styles.header, styles.centerContent]}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>InvisiFeed</Text>
              <Text style={styles.companyTagline}>Your Feedback Matters</Text>
            </View>
          </View>
          {/* Invoice Details */}
          <View style={styles.orgInfo}>
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceNumber}>
                From: {owner?.organizationName}
              </Text>

              <Text style={styles.invoiceDate}>Email: {owner?.email}</Text>
              {owner?.gstinDetails && (
                <Text style={styles.invoiceDate}>
                  GSTIN holder name: {owner?.gstinDetails?.gstinHolderName}
                </Text>
              )}
            </View>
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceNumber}>Invoice: {invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>Invoice Date: {currentDate}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={[styles.body, styles.centerContent]}>
            <Text style={[styles.infoTextBold, styles.textCenter]}>
              Scan this QR code to share your valuable feedback
            </Text>
            <Text style={[styles.infoText, styles.textCenter]}>
              Your insights help us deliver exceptional service
            </Text>
            <Text style={[styles.infoText, styles.textCenter]}>
              Thank you for choosing InvisiFeed!
            </Text>
            {/* QR Code */}
            <Image src={qrDataUrl} style={styles.qrCode} />
            <Text style={[styles.infoText, styles.link]}>{qrData}</Text>
          </View>

          {/* Coupon Section */}
          {modifiedCouponCode && (
            <View style={styles.feedbackSection}>
              <Text style={styles.couponHeader}>WIN EXCLUSIVE COUPONS!</Text>
              <View style={styles.feedbackText}>
                <Text>
                  Complete the feedback form to claim amazing discounts and
                  special offers.
                </Text>
                <Text>Your voice helps us serve you better!</Text>
              </View>
            </View>
          )}

          {/*Disclaimer + Footer*/}

          <View style={styles.discFooter}>
            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Disclaimer: This tool is meant strictly for generating valid
                business invoices. Any misuse, such as fake invoicing or GST
                fraud, is punishable under the GST Act, 2017 and Bharatiya Nyaya
                Sanhita (BNS), 2023 (Sections 316 & 333). The user is solely
                responsible for the accuracy of GSTIN or any missing
                information; as per Rule 46 of the CGST Rules, furnishing
                correct invoice details is the supplier’s responsibility. We are
                not liable for any incorrect, fake, or missing GSTIN entered by
                users.{" "}
              </Text>
            </View>

            {/* Created with */}
            <Text style={styles.createdWith}>
              Created with{" "}
              <Text style={styles.createdWithSpan}>InvisiFeed</Text>
            </Text>
          </View>
        </Page>
      </Document>
    );

    // Render to stream
    const stream = await renderToStream(<QrDocument />);

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error generating QR PDF:", error);
    throw error;
  }
}
async function mergePdfs(invoicePdfBuffer, qrPdfBuffer) {
  try {
    // Unfortunately, react-pdf doesn't provide direct PDF merging capabilities
    // We'll continue using pdf-lib for merging as it's more suitable for this task
    const PDFDocument = require("pdf-lib").PDFDocument;

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
