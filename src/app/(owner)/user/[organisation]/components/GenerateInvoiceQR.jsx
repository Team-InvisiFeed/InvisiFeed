"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Download } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center w-full max-w-3xl bg-[#0A0A0A]/50 backdrop-blur-sm text-white shadow-xl rounded-xl border border-yellow-400/10 p-8"
      >
        <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
          Upload PDF & Extract Invoice Number
        </h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Upload your invoice PDF to generate a QR code and extract the invoice
          number
        </p>

        {/* File Input Section */}
        <div className="mb-8 flex flex-col items-center w-full">
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
            className="w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-lg cursor-pointer transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
          >
            <Upload className="h-5 w-5" />
            <span>Choose PDF File</span>
          </label>
          {/* Display File Name */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center space-x-2 text-gray-300"
            >
              <FileText className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">
                Selected:{" "}
                <span className="font-medium text-yellow-400">{file.name}</span>
              </span>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full max-w-md px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            "Upload & Extract"
          )}
        </motion.button>

        {invoiceNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-2 text-yellow-400">
              Extracted Invoice Number
            </h2>
            <p className="text-2xl font-bold text-white">{invoiceNumber}</p>
          </motion.div>
        )}

        {pdfUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4 text-yellow-400">
              Processed PDF Ready
            </h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF with QR Code</span>
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
