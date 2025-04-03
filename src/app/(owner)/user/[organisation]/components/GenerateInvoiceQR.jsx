"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Download, Share2 } from "lucide-react";

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
  const [customerEmail, setCustomerEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponData, setCouponData] = useState({
    couponCode: "",
    description: "",
    expiryDays: "30",
  });
  const [couponSaved, setCouponSaved] = useState(false);

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
    // Reset email states when new file is selected
    setEmailSent(false);
    setCustomerEmail("");
  };

  const handleCouponSave = () => {
    if (
      !couponData.couponCode ||
      !couponData.description ||
      !couponData.expiryDays
    ) {
      alert("Please fill all coupon fields");
      return;
    }
    setCouponSaved(true);
    setShowCouponForm(false);
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
    if (couponSaved) {
      formData.append("couponData", JSON.stringify(couponData));
    }

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
        setEmailSent(false);
        setCustomerEmail("");
        setCouponSaved(false);
        setCouponData({
          couponCode: "",
          description: "",
          expiryDays: 30,
        });
      }
    } catch (error) {
      alert("Something went wrong! Please try again.");
    }

    setLoading(false);
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      alert("Please enter customer email");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch("/api/send-invoice-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail,
          invoiceNumber,
          pdfUrl,
          companyName: owner?.organizationName || "Your Company",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        setCustomerEmail(""); // Clear the email field
      } else {
        alert(data.error || "Failed to send email. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong while sending the email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
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

            {/* Create Coupon Button */}
            {file && !couponSaved && (
              <button
                onClick={() => setShowCouponForm(true)}
                className="w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Create Coupon for this Customer</span>
              </button>
            )}

            {couponSaved && (
              <div className="w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-lg transition-all duration-200 shadow-lg  ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Coupon Saved</span>
              </div>
            )}

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
              <div className="relative space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-yellow-400">
                    Processed PDF Ready
                  </h2>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(pdfUrl);
                        const blob = await response.blob();
<<<<<<< HEAD
                        const file = new File(
                          [blob],
                          `Invoice by ${owner?.organizationName}.pdf`,
                          {
                            type: "application/pdf",
                          }
                        );
=======
                        const file = new File([blob], `Invoice from ${owner.organizationName}.pdf`, {
                          type: "application/pdf",
                        });
>>>>>>> 90a31b7249a21d5d382a16e808bf5cb8a5430866

                        if (
                          navigator.canShare &&
                          navigator.canShare({ files: [file] })
                        ) {
                          await navigator.share({
                            title: "Invoice",
                            text: "Here's your invoice PDF generated by Invisifeed.",
                            files: [file],
                          });
                        } else {
                          alert("Sharing not supported on this device.");
                        }
                      } catch (error) {
                        console.error("Error sharing PDF:", error);
                        alert("Failed to share PDF. Please try again.");
                      }
                    }}
                    className="p-2 hover:bg-yellow-400/10 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-yellow-400 cursor-pointer" />
                  </button>
                </div>

                {/* Email Input */}
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Enter Customer Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0A0A0A]/50 border border-yellow-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    disabled={sendingEmail || emailSent}
                  />
                </div>

                {/* Email Button */}
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || emailSent || !customerEmail}
                  className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : emailSent ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Email Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>Send Invoice via Email</span>
                    </>
                  )}
                </button>

                {/* Download Button */}
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

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md border border-yellow-400/20"
          >
            <h2 className="text-xl font-bold mb-4 text-yellow-400">
              Create Coupon
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponData.couponCode}
                  onChange={(e) =>
                    setCouponData({
                      ...couponData,
                      couponCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-yellow-400/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Enter coupon code"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This coupon code will go under slight modification for
                  security purposes
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={couponData.description}
                  onChange={(e) =>
                    setCouponData({
                      ...couponData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-yellow-400/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  placeholder="Enter coupon description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expiry (in days)
                </label>
                <input
                  type="number"
                  value={couponData.expiryDays}
                  onChange={(e) =>
                    setCouponData({
                      ...couponData,
                      expiryDays: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#0A0A0A] border border-yellow-400/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCouponForm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCouponSave}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
