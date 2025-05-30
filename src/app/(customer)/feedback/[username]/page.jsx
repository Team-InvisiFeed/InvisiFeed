"use client";

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  Loader2,
  Download,
  Printer,
  Gift,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import { BsEmojiAngryFill, BsEmojiSmileFill, BsEmojiNeutralFill, BsEmojiFrownFill, BsEmojiHeartEyesFill,BsEmojiSunglassesFill } from "react-icons/bs";
import { FaFaceGrinStars } from "react-icons/fa6";


const emojiOptions = [
  { value: 1, emoji: <BsEmojiAngryFill />, label: "Very Dissatisfied" },
  { value: 2, emoji: <BsEmojiFrownFill />, label: "Dissatisfied" },
  { value: 3, emoji: <BsEmojiNeutralFill />, label: "Neutral" },
  { value: 4, emoji: <BsEmojiSmileFill />, label: "Satisfied" },
  { value: 5, emoji: <BsEmojiHeartEyesFill />, label: "Very Satisfied" },
];

function FeedbackFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username;
  const decodedUsername = decodeURIComponent(username);
  const invoiceNumber = searchParams.get("invoiceNo");
  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);
  const queryCouponCode = searchParams.get("cpcd");
  const couponCode = queryCouponCode ? queryCouponCode.slice(4) : "";

  const [formData, setFormData] = useState({
    satisfactionRating: 3,
    communicationRating: 3,
    qualityOfServiceRating: 3,
    valueForMoneyRating: 3,
    recommendRating: 3,
    overAllRating: 3,
    feedbackContent: "",
    suggestionContent: "",
    anonymousFeedback: false,
  });

  const [businessName, setBusinessName] = useState("");

  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [invalidInvoice, setInvalidInvoice] = useState(null);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [aiLimitReached, setAiLimitReached] = useState(false);
  const [feedbackAlreadySubmitted, setFeedbackAlreadySubmitted] =
    useState(false);
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] =
    useState(false);
  const [couponInfo, setCouponInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const checkInvoiceAndUser = async () => {
    try {
      // Properly encode parameters
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("invoiceNumber", invoiceNumber);
      if (couponCode) {
        params.append("couponCode", couponCode);
      }

      const { data } = await axios.get(
        `/api/check-invoice?${params.toString()}`
      );

      setInvalidInvoice(false);
      setFeedbackAlreadySubmitted(false);

      const owner = data.owner;
      if (owner) {
        setBusinessName(owner.businessName);
      }
      const invoice = data.invoice;
      if (!invoice) {
        setAiUsageCount(0);
        setAiLimitReached(false);
      } else {
        setAiUsageCount(invoice?.AIuseCount || 0);
        setAiLimitReached((invoice?.AIuseCount || 0) >= 3);

        // If there's a coupon code in URL, verify it matches the invoice's coupon
        if (couponCode && invoice?.couponAttached?.couponCode === couponCode) {
          setCouponInfo(invoice.couponAttached);
        }
      }
    } catch (error) {
      console.error(
        "Invoice check error:",
        error.response?.data.message || error
      );
      if (error.response && error.response.status === 404) {
        if (error.response.data.message === "Feedback already submitted") {
          setFeedbackAlreadySubmitted(true);
        } else {
          setInvalidInvoice(true);
        }
      } else {
        console.error("An unexpected error occurred:", error.message);
        toast.error(
          error.response?.data?.message || "Failed to verify invoice"
        );
      }
    }
  };

  useEffect(() => {
    checkInvoiceAndUser();
  }, [username, invoiceNumber, couponCode]);

  const feedbackCharacterCount = formData.feedbackContent.length;
  const suggestionCharacterCount = formData.suggestionContent.length;

  const maxCharCount = 500;

  const handleFeedbackChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxCharCount) {
      handleChange("feedbackContent", newContent);
    }
  };

  const handleSuggestionChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxCharCount) {
      handleChange("suggestionContent", newContent);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const response = await axios.post("/api/submit-feedback", {
        formData,
        username: decodedUsername,
        invoiceNumber: decodedInvoiceNumber,
      });

      if (response.status == 201) {
        const result = await axios.put("/api/set-recommended-actions", {
          username: decodedUsername,
          invoiceNumber: decodedInvoiceNumber,
        });
        setIsLoading(false);
        if (result.status == 201) {
          toast.success("Feedback submitted successfully");
          setFeedbackSubmittedSuccess(true);
        } else {
          toast.error("Failed to submit feedback. Please try again.");
        }
      }
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFeedbackAI = async () => {
    try {
      if (aiLimitReached) {
        toast.error("AI usage limit reached for this invoice");
        return;
      }

      setLoadingFeedback(true);
      const response = await axios.post("/api/generate-feedback", {
        satisfactionRating: formData.satisfactionRating,
        communicationRating: formData.communicationRating,
        qualityOfServiceRating: formData.qualityOfServiceRating,
        valueForMoneyRating: formData.valueForMoneyRating,
        recommendRating: formData.recommendRating,
        overAllRating: formData.overAllRating,
        feedbackContent: formData.feedbackContent,
        username: decodedUsername,
        invoiceNumber: decodedInvoiceNumber,
      });

      if (response.status == 201) {
        handleChange("feedbackContent", response.data.feedback);
        setAiUsageCount((prev) => prev + 1);
        if (aiUsageCount + 1 >= 3) {
          setAiLimitReached(true);
        }
        toast.success("AI-generated feedback added!");
      } else {
        if (response.status === 429) {
          setAiLimitReached(true);
          toast.error("AI usage limit reached for this invoice");
        } else {
          toast.error(response.data.message || "Failed to generate feedback");
        }
      }
    } catch (error) {
      console.error(
        "Error generating feedback:",
        error?.response?.data?.message
      );
      toast.error("Something went wrong!");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const generateSuggestionsAI = async () => {
    try {
      if (aiLimitReached) {
        toast.error("AI usage limit reached for this invoice");
        return;
      }

      setLoadingSuggestion(true);
      const response = await axios.post("/api/generate-suggestion", {
        satisfactionRating: formData.satisfactionRating,
        communicationRating: formData.communicationRating,
        qualityOfServiceRating: formData.qualityOfServiceRating,
        valueForMoneyRating: formData.valueForMoneyRating,
        recommendRating: formData.recommendRating,
        overAllRating: formData.overAllRating,
        feedbackContent: formData.feedbackContent,
        suggestionContent: formData.suggestionContent,
        username: decodedUsername,
        invoiceNumber: decodedInvoiceNumber,
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.suggestion
      ) {
        handleChange("suggestionContent", response.data.data.suggestion);
        setAiUsageCount((prev) => prev + 1);
        if (aiUsageCount + 1 >= 3) {
          setAiLimitReached(true);
        }
        toast.success("AI-generated Suggestion added!");
      } else {
        toast.error("Failed to generate suggestion");
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      if (error.response?.status === 429) {
        setAiLimitReached(true);
        toast.error("AI usage limit reached for this invoice");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const downloadCoupon = () => {
    if (!couponInfo) return;

    const content = `
      Coupon Code: ${couponInfo.couponCode}
      Description: ${couponInfo.couponDescription}
      Expiry Date: ${format(new Date(couponInfo.couponExpiryDate), "PPP")}
      
      Thank you for your feedback!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupon_${couponInfo.couponCode}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const printCoupon = () => {
    if (!couponInfo) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Your Coupon</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
              background: #0A0A0A;
              color: #fff;
            }
            .coupon-container {
              border: 2px dashed #FFD700;
              padding: 20px;
              margin: 20px;
              border-radius: 10px;
              background: rgba(255, 215, 0, 0.1);
            }
            h1 {
              color: #FFD700;
              margin-bottom: 20px;
            }
            .coupon-code {
              font-size: 24px;
              font-weight: bold;
              color: #FFD700;
              margin: 20px 0;
              padding: 10px;
              background: rgba(255, 215, 0, 0.1);
              border-radius: 5px;
            }
            .coupon-details {
              margin: 15px 0;
              line-height: 1.6;
            }
            .expiry {
              color: #FFD700;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="coupon-container">
            <h1>🎉 Congratulations! 🎉</h1>
            <p>You've earned a special discount!</p>
            <div class="coupon-code">${couponInfo.couponCode}</div>
            <div class="coupon-details">
              <p><strong>Description:</strong> ${
                couponInfo.couponDescription
              }</p>
              <p class="expiry">Valid until: ${format(
                new Date(couponInfo.couponExpiryDate),
                "PPP"
              )}</p>
            </div>
            <p>Thank you for your valuable feedback!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#FFD700", "#FFA500", "#FF6B6B"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#FFD700", "#FFA500", "#FF6B6B"],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  };

  useEffect(() => {
    if (feedbackSubmittedSuccess && couponInfo) {
      triggerConfetti();
    }
  }, [feedbackSubmittedSuccess, couponInfo]);

  if (feedbackSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20">
            <CardHeader className="border-b border-yellow-400/20">
              <CardTitle className="text-2xl font-bold text-yellow-400 text-center">
                Feedback Successfully Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-400 text-center mb-6">
                Thank you for your valuable feedback!
              </p>

              {couponInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 mb-6 relative overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <Gift className="w-8 h-8 text-yellow-400 mr-2" />
                      <h3 className="text-lg font-semibold text-yellow-400">
                        Your Special Coupon
                      </h3>
                    </div>
                    <div className="space-y-3 text-gray-300">
                      <div className="bg-yellow-400/10 p-3 rounded-lg text-center">
                        <p className="text-sm text-yellow-400/80 mb-1">
                          Coupon Code
                        </p>
                        <p className="text-2xl font-bold text-yellow-400 tracking-wider">
                          {couponInfo.couponCode}
                        </p>
                      </div>
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {couponInfo.couponDescription}
                      </p>
                      <p>
                        <span className="font-medium">Expires:</span>{" "}
                        {format(new Date(couponInfo.couponExpiryDate), "PPP")}
                      </p>
                    </div>
                    <Button
                      onClick={printCoupon}
                      className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Coupon
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (feedbackAlreadySubmitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Feedback Already Submitted
          </h2>
          <p className="text-gray-400">
            You have already submitted feedback for this invoice.
          </p>
        </div>
      </div>
    );
  }

  if (invalidInvoice === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Checking Invoice...</span>
        </div>
      </div>
    );
  }

  if (invalidInvoice === true) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Invalid Invoice
          </h2>
          <p className="text-gray-400">
            Please check your invoice number and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-6 sm:py-12 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl mx-auto bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20 ">
          <CardHeader className="border-b border-yellow-400/20 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400">
              Service Feedback for {businessName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Rating Fields */}
              {[
                { key: "satisfactionRating", label: "Overall Satisfaction" },
                { key: "communicationRating", label: "Communication" },
                { key: "qualityOfServiceRating", label: "Quality of Service" },
                { key: "valueForMoneyRating", label: "Value for Money" },
                { key: "recommendRating", label: "Likelihood to Recommend" },
                { key: "overAllRating", label: "Overall Rating" },
              ].map(({ key, label }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Label className="block mb-2 sm:mb-3 text-base sm:text-lg font-medium text-gray-200">
                    {label}
                  </Label>
                  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0">
                    {emojiOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange(key, option.value)}
                        className={`text-2xl text-white sm:text-3xl p-2 flex-shrink-0 ${
                          formData[key] === option.value
                            ? "text-yellow-400 "
                            : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        {option.emoji}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-yellow-400/80 mt-1 sm:mt-2 block">
                    {emojiOptions.find((e) => e.value === formData[key])?.label}
                  </span>
                </motion.div>
              ))}

              {/* Custom Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <Label className="text-base sm:text-lg font-medium text-gray-200">
                    Additional Feedback
                  </Label>
                  <span className="text-xs text-gray-400">
                    {feedbackCharacterCount}/{maxCharCount} characters
                  </span>
                </div>
                <Textarea
                  placeholder="Share your thoughts here..."
                  value={formData.feedbackContent}
                  onChange={handleFeedbackChange}
                  className="min-h-[100px] sm:min-h-[120px] bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-sm sm:text-base"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-yellow-400/80">
                    AI Usage: {aiUsageCount}/3
                  </span>
                  <Button
                    type="button"
                    onClick={generateFeedbackAI}
                    className="p-1.5 sm:p-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                    variant="ghost"
                    title={
                      aiLimitReached
                        ? "AI usage limit reached"
                        : "Generate Feedback using AI"
                    }
                    disabled={loadingFeedback || aiLimitReached}
                  >
                    {loadingFeedback ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Wand2 size={16} className="sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative"
              >
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <Label className="text-base sm:text-lg font-medium text-gray-200">
                    Any Suggestions?
                  </Label>
                  <span className="text-xs text-gray-400">
                    {suggestionCharacterCount}/{maxCharCount} characters
                  </span>
                </div>
                <Textarea
                  placeholder="Let us know how we can improve..."
                  value={formData.suggestionContent}
                  onChange={handleSuggestionChange}
                  className="min-h-[100px] sm:min-h-[120px] bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-sm sm:text-base"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-yellow-400/80">
                    AI Usage: {aiUsageCount}/3
                  </span>
                  <Button
                    type="button"
                    onClick={generateSuggestionsAI}
                    className="p-1.5 sm:p-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                    variant="ghost"
                    title={
                      aiLimitReached
                        ? "AI usage limit reached"
                        : "Generate Suggestion using AI"
                    }
                    disabled={loadingSuggestion || aiLimitReached}
                  >
                    {loadingSuggestion ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Sparkles size={16} className="sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Checkbox for anonymous feedback */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymousFeedback"
                  checked={formData.anonymousFeedback}
                  onChange={(e) =>
                    handleChange("anonymousFeedback", e.target.checked)
                  }
                  className="w-4 h-4 text-yellow-400 accent-yellow-400"
                />
                <Label htmlFor="anonymousFeedback" className="text-gray-200">
                  Submit anonymously
                </Label>
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {isLoading ? (
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold py-4 sm:py-6 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 text-sm sm:text-base disabled"
                  >
                    Submitting...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold py-4 sm:py-6 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 text-sm sm:text-base cursor-pointer"
                  >
                    Submit Feedback
                  </Button>
                )}
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-8 sm:mt-10 text-center p-4 sm:p-6 rounded-lg border border-yellow-400/20 
             bg-gradient-to-br   hover:from-yellow-400/20  transition-all duration-300 max-w-2xl mx-auto"
      >
        <p className="text-sm sm:text-base text-gray-200 font-medium">
          Are you a service provider? Want to gather anonymous feedback and gain
          valuable insights from your customers?
        </p>
        <p className="text-sm sm:text-base text-yellow-400 font-semibold mt-2">
          Explore{" "}
          <a
            href="https://invisifeed.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-300"
          >
            InvisiFeed
          </a>{" "}
          now and transform the way you understand your audience!
        </p>
      </motion.div>
    </div>
  );
}

export default function FeedbackForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackFormContent />
    </Suspense>
  );
}
