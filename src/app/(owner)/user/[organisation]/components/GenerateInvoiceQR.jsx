"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const owner = session?.user;

  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", owner.username);

    try {
      const res = await fetch("/api/upload-invoice", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setPdfUrl(data.url);
        setInvoiceNumber(data.invoiceNumber);
      }
    } catch (error) {
      alert("Something went wrong! Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center h-[80vh] w-[95%] max-w-5xl bg-white text-gray-800 shadow-md rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Upload PDF & Extract Invoice Number
        </h1>
        {/* File Input Section */}
        <div className="mb-6 flex flex-col items-center">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          {/* Custom Button */}
          <label
            htmlFor="file-upload"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
          >
            Choose File
          </label>
          {/* Display File Name */}
          {file && (
            <p className="mt-2 text-gray-600 text-sm">
              Selected File: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Extract"}
        </button>

        {invoiceNumber && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-bold mb-2">
              Extracted Invoice Number:
            </h2>
            <p className="text-green-600 text-xl">{invoiceNumber}</p>
          </div>
        )}

        {pdfUrl && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-bold mb-2">Final Processed PDF:</h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download PDF with QR Code
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
