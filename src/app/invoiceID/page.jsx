"use client";
import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Set the worker source for pdfjs-dist
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const InvoiceOrderIdExtractor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const extractIds = async () => {
    if (!selectedFile) {
      alert("Please upload an invoice first.");
      return;
    }

    setIsProcessing(true);
    setExtractedText("");
    setOrderId("");
    setInvoiceId("");

    try {
      if (selectedFile.type === "application/pdf") {
        // Process PDF file
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await getDocument(typedArray).promise;

          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            fullText += pageText + " ";
          }

          setExtractedText(fullText);
          // Updated regex patterns for more flexible matching
          const orderIdMatch = fullText.match(
            /(?:order\s*(?:id|no|number)|invoice\s*(?:id|no|number))[:\s]*([A-Za-z0-9\-#\/_]+)/i
          );

          if (orderIdMatch) {
            setOrderId(orderIdMatch[1]);
          } else {
            setOrderId("Order ID not found in the invoice.");
          }

          const invoiceIdMatch = fullText.match(
            /(?:invoice\s*(?:id|no|number)|order\s*(?:id|no|number))[:\s]*([A-Za-z0-9\-#\/_]+)/i
          );

          if (invoiceIdMatch) {
            setInvoiceId(invoiceIdMatch[1]);
          } else {
            setInvoiceId("Invoice ID not found in the invoice.");
          }
        };
        fileReader.readAsArrayBuffer(selectedFile);
      } else {
        // Process Image file
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target.result;
          const { data } = await Tesseract.recognize(imageData, "eng");
          const text = data.text;
          setExtractedText(text);

          // Updated regex patterns for more flexible matching
          const orderIdMatch = text.match(
            /(?:order\s*(?:id|no)|invoice\s*(?:id|no))[:\s]*([A-Za-z0-9\-]+)/i
          );
          if (orderIdMatch) {
            setOrderId(orderIdMatch[1]);
          } else {
            setOrderId("Order ID not found in the invoice.");
          }

          const invoiceIdMatch = text.match(
            /(?:invoice\s*(?:id|no)|order\s*(?:id|no))[:\s]*([A-Za-z0-9\-]+)/i
          );
          if (invoiceIdMatch) {
            setInvoiceId(invoiceIdMatch[1]);
          } else {
            setInvoiceId("Invoice ID not found in the invoice.");
          }
        };
        reader.readAsDataURL(selectedFile);
      }
    } catch (error) {
      console.error("Error during text extraction:", error);
      alert("Failed to extract text from the invoice.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <h1 className="text-xl font-bold mb-4">
            Invoice and Order ID Extractor
          </h1>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mb-4"
          />
          <Button onClick={extractIds} disabled={isProcessing}>
            {isProcessing ? "Extracting..." : "Extract IDs"}
          </Button>

          {extractedText && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Extracted Text:</h2>
              <p className="bg-gray-100 p-2 rounded-md">{extractedText}</p>
            </div>
          )}

          {orderId && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Order ID:</h2>
              <p className="bg-green-100 p-2 rounded-md">{orderId}</p>
            </div>
          )}

          {invoiceId && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Invoice ID:</h2>
              <p className="bg-blue-100 p-2 rounded-md">{invoiceId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceOrderIdExtractor;
