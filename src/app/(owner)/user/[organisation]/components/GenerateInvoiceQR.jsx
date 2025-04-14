"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Download, Share2, FileUp, Plus } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";
import CreateInvoiceForm from "./CreateInvoiceForm";

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
  const [showSampleInvoices, setShowSampleInvoices] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [couponData, setCouponData] = useState({
    couponCode: "",
    description: "",
    expiryDays: "30",
  });
  const [couponSaved, setCouponSaved] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample invoice data
  const sampleInvoices = [
    {
      id: 1,
      name: "Sample Invoice 1",
      url: "https://res.cloudinary.com/dzcrmyin0/image/upload/v1744027611/sample_invoice_2_cloudinary_ar8q9t.pdf",
    },
    {
      id: 2,
      name: "Sample Invoice 2",
      url: "https://res.cloudinary.com/dzcrmyin0/image/upload/v1744027612/sample_invoice_1_cloudinary_k8khff.pdf",
    },
    {
      id: 3,
      name: "Sample Invoice 3",
      url: "https://res.cloudinary.com/dzcrmyin0/image/upload/v1744027612/sample_invoice_4_cloudinary_ysupfs.pdf",
    },
    {
      id: 4,
      name: "Sample Invoice 4",
      url: "https://res.cloudinary.com/dzcrmyin0/image/upload/v1744027612/sample_invoice_5_cloudinary_d7lpvv.pdf",
    },
    {
      id: 5,
      name: "Sample Invoice 5",
      url: "https://res.cloudinary.com/dzcrmyin0/image/upload/v1744027612/sample_invoice_3_cloudinary_pxnvlb.pdf",
    },
  ];

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
          setUploadCount(data.count);
          if (data.dailyLimit) {
            setDailyLimit(data.dailyLimit);
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

  const handleConfirm = (message, action) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check if file size is greater than 3MB
    if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit. Please select a smaller file.");
      return;
    }

    setFile(selectedFile);
    setEmailSent(false);
    setCustomerEmail("");
  };

  const handleCouponSave = () => {
    if (
      !couponData.couponCode ||
      !couponData.description ||
      !couponData.expiryDays
    ) {
      toast.error("Please fill all coupon fields");
      return;
    }
    setCouponSaved(true);
    setShowCouponForm(false);
    toast.success("Coupon saved successfully");
  };

  const handleSampleInvoiceSelect = async (sampleInvoice) => {
    try {
      // Fetch the sample invoice PDF
      const response = await fetch(sampleInvoice.url);
      const blob = await response.blob();

      // Check if file size is greater than 3MB
      if (blob.size > 3 * 1024 * 1024) {
        toast.error(
          "Sample invoice size exceeds 3MB limit. Please select a different sample invoice."
        );
        return;
      }

      // Create a File object from the blob
      const file = new File([blob], `${sampleInvoice.name}.pdf`, {
        type: "application/pdf",
      });

      // Set the file and close the modal
      setFile(file);
      setShowSampleInvoices(false);
    } catch (error) {
      console.error("Error loading sample invoice:", error);
      alert("Failed to load sample invoice. Please try again.");
    }
  };

  const handleUploadWithFile = async (fileToUpload) => {
    if (!fileToUpload) {
      toast.error("Please select a PDF file.");
      return;
    }

    // Check if file size is greater than 3MB
    if (fileToUpload.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit. Please select a smaller file.");
      return;
    }

    if (uploadCount >= dailyLimit) {
      toast.error(`Daily upload limit (${dailyLimit}) reached`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("username", owner.username);
    if (couponSaved) {
      formData.append("couponData", JSON.stringify(couponData));
    }
    // Check if this is a sample invoice
    const isSampleInvoice = sampleInvoices.some(
      (sample) => fileToUpload.name === `${sample.name}.pdf`
    );
    formData.append("isSampleInvoice", isSampleInvoice);

    try {
      const res = await fetch("/api/upload-invoice", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        if (res.status === 429) {
          setTimeLeft(data.timeLeft);
          toast.error(
            `Daily upload limit reached. Please try again after ${data.timeLeft} hours.`
          );
        } else {
          toast.error(`Error: ${data.error}`);
        }
      } else {
        setPdfUrl(data.url);
        setInvoiceNumber(data.invoiceNumber);
        setDailyUploads((prev) => prev + 1);
        setUploadCount((prev) => prev + 1);
        setEmailSent(false);
        setCustomerEmail("");
        setCouponSaved(false);
        setCouponData({
          couponCode: "",
          description: "",
          expiryDays: 30,
        });
        toast.success("Invoice uploaded successfully");
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    }

    setLoading(false);
  };

  const handleUpload = async () => {
    await handleUploadWithFile(file);
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      toast.error("Please enter customer email");
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
        setCustomerEmail("");
        toast.success("Email sent successfully");
      } else {
        toast.error(data.error || "Failed to send email. Please try again.");
      }
    } catch (error) {
      toast.error(
        "Something went wrong while sending the email. Please try again."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleResetData = async () => {
    try {
      const res = await fetch("/api/reset-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: owner.username }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Data reset successfully");
        setFile(null);
        setPdfUrl("");
        setInvoiceNumber("");
        setCustomerEmail("");
        setEmailSent(false);
        setShowSampleInvoices(false);
      } else {
        toast.error("Failed to reset data: " + data.message);
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data. Please try again.");
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    if (uploadCount >= dailyLimit) {
      toast.error(`Daily upload limit (${dailyLimit}) reached`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...invoiceData,
          username: owner.username,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPdfUrl(data.url);
        setInvoiceNumber(data.invoiceNumber);
        setUploadCount((prev) => prev + 1);
        setShowCreateInvoice(false);
        toast.success("Invoice created successfully");
      } else {
        toast.error(
          data.error || "Failed to create invoice. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfirmModal && (
        <ConfirmModal
          message="Are you sure you want to reset all data? This will remove all invoices, feedbacks, and recommendations."
          onConfirm={() => {
            setShowConfirmModal(false);
            confirmAction();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center w-full max-w-3xl bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="relative z-10 w-full">
            <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-gray-400 text-sm mb-8 text-center">
              Create a new invoice or upload an existing one
            </p>

            {/* Daily Upload Limit Info */}
            <div className="mb-6 text-center">
              {initialLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">
                    Loading upload status...
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0A0A0A]/50 rounded-full border border-yellow-400/20">
                  <p className="text-sm text-gray-300">
                    Daily Uploads: <span className="font-medium text-yellow-400">{dailyUploads}</span>/<span className="font-medium text-yellow-400">{dailyLimit}</span>
                  </p>
                  {timeLeft && (
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                      {timeLeft}h remaining
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Invoice</span>
              </button>
            </div>

            {/* Display File Name */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-gray-300 mb-4 bg-[#0A0A0A]/50 p-3 rounded-lg border border-yellow-400/10"
              >
                <FileText className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">
                  Selected:{" "}
                  <span className="font-medium text-yellow-400">
                    {file.name}
                  </span>
                </span>
              </motion.div>
            )}

            {/* File Input Section */}
            {!showCreateInvoice && (
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
                  className={`w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105 ${
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
                    className="w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105 cursor-pointer"
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
                    <span>Create Coupon</span>
                  </button>
                )}

                {couponSaved && (
                  <div className="w-full max-w-md flex flex-col items-center space-y-2">
                    <button
                      onClick={() => setShowCouponForm(true)}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-xl transition-all duration-300 shadow-lg hover:scale-105 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <span>Edit Coupon</span>
                    </button>
                    <p
                      onClick={() => {
                        setCouponSaved(false);
                        setCouponData({
                          couponCode: "",
                          description: "",
                          expiryDays: "30",
                        });
                        toast.success("Coupon deleted successfully");
                      }}
                      className="text-gray-400 hover:text-yellow-400 text-sm cursor-pointer transition-colors"
                    >
                      Delete Coupon
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <div className="w-full max-w-md mx-auto">
                  <motion.button
                    onClick={handleUpload}
                    disabled={
                      loading || !file || dailyUploads >= 3 || initialLoading
                    }
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer"
                    whileHover={{
                      scale: dailyUploads < 3 && !initialLoading ? 1.02 : 1,
                    }}
                    whileTap={{
                      scale: dailyUploads < 3 && !initialLoading ? 0.98 : 1,
                    }}
                  >
                    {loading || initialLoading ? (
                      <div className="flex items-center justify-center space-x-2 ">
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        <span>
                          {initialLoading ? "Loading..." : "Processing..."}
                        </span>
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
                <p
                  onClick={() => setShowSampleInvoices(true)}
                  className="text-gray-100 text-sm mt-4 text-center cursor-pointer hover:text-yellow-400 transition-colors"
                  disabled={initialLoading || dailyUploads >= 3}
                >
                  Try out our sample invoices to get started
                </p>
                <p
                  onClick={() =>
                    handleConfirm(
                      "Are you sure you want to reset all data? This will remove all invoices, feedbacks, and recommendations.",
                      handleResetData
                    )
                  }
                  className="text-gray-400 hover:text-yellow-400 text-xs mt-1 text-center cursor-pointer transition-colors"
                >
                  [Reset data if you have sample invoices uploaded]
                </p>
              </div>
            )}

            {/* Create Invoice Form */}
            {showCreateInvoice && (
              <CreateInvoiceForm
                onSave={handleCreateInvoice}
                onCancel={() => setShowCreateInvoice(false)}
              />
            )}

            {invoiceNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-yellow-400/20 w-full max-w-md mx-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h2 className="text-lg font-semibold mb-2 text-yellow-400">
                    Extracted Invoice Number
                  </h2>
                  <p className="text-2xl font-bold text-white">
                    {invoiceNumber}
                  </p>
                </div>
              </motion.div>
            )}

            {pdfUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-yellow-400/20 w-full max-w-md mx-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                          const file = new File(
                            [blob],
                            `Invoice by ${owner?.organizationName}.pdf`,
                            {
                              type: "application/pdf",
                            }
                          );

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
                      className="w-full px-4 py-3 bg-[#0A0A0A]/50 border border-yellow-400/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
                      disabled={sendingEmail || emailSent}
                    />
                  </div>

                  {/* Email Button */}
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || emailSent || !customerEmail}
                    className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105"
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
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-md border border-yellow-400/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                Create Coupon
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
                    placeholder="Enter coupon code"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    This coupon code will go under slight modification for
                    security purposes
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
                    placeholder="Enter coupon description"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowCouponForm(false)}
                  className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCouponSave}
                  className="px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sample Invoices Modal */}
        {showSampleInvoices && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-md border border-yellow-400/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                Select Sample Invoice
              </h2>

              {/* Caution Message */}
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">
                  <strong>Caution:</strong> Sample invoices are for testing
                  purposes only. Not recommended for genuine business data
                  analysis.
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSampleInvoices(false);
                    setTimeout(() => {
                      handleConfirm(
                        "Are you sure you want to reset all data? This will remove all invoices, feedbacks, and recommendations.",
                        handleResetData
                      );
                    }, 100);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm mt-3 inline-block underline"
                >
                  Reset data for genuine data analysis
                </a>
              </div>

              <div className="space-y-3">
                {sampleInvoices.map((invoice) => (
                  <button
                    key={invoice.id}
                    onClick={() => handleSampleInvoiceSelect(invoice)}
                    className="w-full px-5 py-4 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white hover:bg-[#0A0A0A]/80 hover:border-yellow-400/40 transition-all duration-300 flex items-center justify-between cursor-pointer hover:scale-105"
                    disabled={loading || dailyUploads >= 3}
                  >
                    <span>{invoice.name}</span>
                    {loading && file && file.name === `${invoice.name}.pdf` ? (
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileUp className="h-5 w-5 text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowSampleInvoices(false)}
                  className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
