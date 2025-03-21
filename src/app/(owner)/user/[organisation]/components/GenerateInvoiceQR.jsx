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
    formData.append("username", owner.username)

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
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Upload PDF & Extract Invoice Number
      </h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload & Extract"}
      </button>

      {invoiceNumber && (
        <div className="mt-4">
          <h2 className="font-bold">Extracted Invoice Number:</h2>
          <p className="text-green-600 text-lg">{invoiceNumber}</p>
        </div>
      )}

      {pdfUrl && (
        <div className="mt-4">
          <h2 className="font-bold">Final Processed PDF:</h2>
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
  );
}
