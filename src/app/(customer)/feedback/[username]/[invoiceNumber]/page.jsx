"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

const emojiOptions = [
  { value: 1, emoji: "😡", label: "Very Dissatisfied" },
  { value: 2, emoji: "😞", label: "Dissatisfied" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "😊", label: "Satisfied" },
  { value: 5, emoji: "😍", label: "Very Satisfied" },
];

export default function FeedbackForm() {
  const params = useParams();
  const { username, invoiceNumber } = params;

  const [formData, setFormData] = useState({
    satisfactionRating: 3,
    communicationRating: 3,
    qualityOfServiceRating: 3,
    valueForMoneyRating: 3,
    recommendRating: 3,
    overAllRating: 3,
    feedbackContent: "",
    suggestionContent: "",
  });

  const payload = { formData, username, invoiceNumber };
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [invalidInvoice, setInvalidInvoice] = useState(null);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [aiLimitReached, setAiLimitReached] = useState(false);
  const [feedbackAlreadySubmitted, setFeedbackAlreadySubmitted] =
    useState(false);
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] =
    useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const checkInvoiceAndUser = async () => {
    try {
      const response = await axios.post("/api/check-invoice", {
        username,
        invoiceNumber,
      });

      const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);
      setInvalidInvoice(false);
      setFeedbackAlreadySubmitted(false);
      // Get AI usage count
      const owner = response.data.owner;

      if (!owner.invoices) {
        setAiUsageCount(0);
        setAiLimitReached(false);
      } else {
        const invoice = owner.invoices.find(
          (inv) => inv.invoiceId === decodedInvoiceNumber
        );
        setAiUsageCount(invoice?.AIuseCount || 0);
        setAiLimitReached((invoice?.AIuseCount || 0) >= 3);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        if (error.response.data.message === "Feedback already submitted") {
          setFeedbackAlreadySubmitted(true);
        } else {
          setInvalidInvoice(true);
        }
      } else {
        console.error("An unexpected error occurred:", error.message);
        toast(error.message);
      }
    }
  };

  useEffect(() => {
    checkInvoiceAndUser();
  }, [username, invoiceNumber]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post("/api/submit-feedback", payload);
      setFeedbackSubmittedSuccess(true);
      if (response.status == 201) {
        const result = await axios.post("/api/set-recommended-actions", {username});
        console.log(result);
      }
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const generateFeedbackAI = async () => {
    try {
      if (aiLimitReached) {
        toast.error("AI usage limit reached for this invoice");
        return;
      }

      setLoadingFeedback(true);
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          satisfactionRating: formData.satisfactionRating,
          communicationRating: formData.communicationRating,
          qualityOfServiceRating: formData.qualityOfServiceRating,
          valueForMoneyRating: formData.valueForMoneyRating,
          recommendRating: formData.recommendRating,
          overAllRating: formData.overAllRating,
          feedbackContent: formData.feedbackContent,
          username,
          invoiceNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        handleChange("feedbackContent", data.feedback);
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
          toast.error(data.message || "Failed to generate feedback");
        }
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
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
        username,
        invoiceNumber,
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

  if (feedbackSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Feedback Successfully Submitted
          </h2>
          <p className="text-gray-400">Thank you for your valuable feedback!</p>
        </div>
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
        <Card className="w-full max-w-2xl mx-auto bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20">
          <CardHeader className="border-b border-yellow-400/20 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400">
              Service Feedback
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
                        className={`text-2xl sm:text-3xl transition-all duration-200 flex-shrink-0 ${
                          formData[key] === option.value
                            ? "bg-yellow-400/5 rounded-full p-1 border border-yellow-400/10"
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
                <Label className="block mb-2 sm:mb-3 text-base sm:text-lg font-medium text-gray-200">
                  Additional Feedback
                </Label>
                <Textarea
                  placeholder="Share your thoughts here..."
                  value={formData.feedbackContent}
                  onChange={(e) =>
                    handleChange("feedbackContent", e.target.value)
                  }
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
                <Label className="block mb-2 sm:mb-3 text-base sm:text-lg font-medium text-gray-200">
                  Any Suggestions?
                </Label>
                <Textarea
                  placeholder="Let us know how we can improve..."
                  value={formData.suggestionContent}
                  onChange={(e) =>
                    handleChange("suggestionContent", e.target.value)
                  }
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

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold py-4 sm:py-6 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 text-sm sm:text-base"
                >
                  Submit Feedback
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
