"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Download } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const owner = session?.user;

  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyUploads, setDailyUploads] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch initial upload count
  useEffect(() => {
    const fetchUploadCount = async () => {
      if (!owner?.username) return;

      try {
        const res = await fetch(`/api/upload-count?username=${owner.username}`);
        const data = await res.json();

        if (data.success) {
          setDailyUploads(data.dailyUploads);
          if (data.timeLeft) {
            setTimeLeft(data.timeLeft);
          }
        }
      } catch (error) {
        console.error("Error fetching upload count:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUploadCount();
  }, [owner?.username]);

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
        if (res.status === 429) {
          setTimeLeft(data.timeLeft);
          alert(
            `Daily upload limit reached. Please try again after ${data.timeLeft} hours.`
          );
        } else {
          alert(`Error: ${data.error}`);
        }
      } else {
        setPdfUrl(data.url);
        setInvoiceNumber(data.invoiceNumber);
        setDailyUploads((prev) => prev + 1);
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
        className="flex flex-col items-center justify-center w-full max-w-3xl bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm text-white shadow-xl rounded-xl border border-yellow-400/10 p-8 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Upload PDF & Extract Invoice Number
          </h1>
          <p className="text-gray-400 text-sm mb-8 text-center">
            Upload your invoice PDF to generate a QR code and extract the
            invoice number
          </p>

          {/* Daily Upload Limit Info */}
          <div className="mb-4 text-center">
            {initialLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">
                  Loading upload status...
                </span>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400">
                  Daily Uploads: {dailyUploads}/3
                </p>
                {timeLeft && (
                  <p className="text-sm text-yellow-400">
                    Time remaining: {timeLeft} hours
                  </p>
                )}
              </>
            )}
          </div>

          {/* File Input Section */}
          <div className="mb-8 flex flex-col items-center w-full space-y-4">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={initialLoading}
            />
            {/* Custom Button */}
            <label
              htmlFor="file-upload"
              className={`w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-lg cursor-pointer transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 ${
                initialLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>Choose PDF File</span>
            </label>
            {/* Display File Name */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-gray-300"
              >
                <FileText className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">
                  Selected:{" "}
                  <span className="font-medium text-yellow-400">
                    {file.name}
                  </span>
                </span>
              </motion.div>
            )}
          </div>

          <div className="w-full max-w-md mx-auto">
            <motion.button
              onClick={handleUpload}
              disabled={loading || !file || dailyUploads >= 3 || initialLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              whileHover={{
                scale: dailyUploads < 3 && !initialLoading ? 1.02 : 1,
              }}
              whileTap={{
                scale: dailyUploads < 3 && !initialLoading ? 0.98 : 1,
              }}
            >
              {loading || initialLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  <span>{initialLoading ? "Loading..." : "Processing..."}</span>
                </div>
              ) : dailyUploads >= 3 ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>Daily Limit Reached</span>
                  {timeLeft && (
                    <span className="text-sm">({timeLeft}h remaining)</span>
                  )}
                </div>
              ) : (
                "Upload & Extract"
              )}
            </motion.button>
          </div>

          {invoiceNumber && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 w-full max-w-md mx-auto group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h2 className="text-lg font-semibold mb-2 text-yellow-400">
                  Extracted Invoice Number
                </h2>
                <p className="text-2xl font-bold text-white">{invoiceNumber}</p>
              </div>
            </motion.div>
          )}

          {pdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 w-full max-w-md mx-auto group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
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
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
