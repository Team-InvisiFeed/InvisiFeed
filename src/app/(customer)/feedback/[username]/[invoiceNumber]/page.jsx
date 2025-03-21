"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";

const emojiOptions = [
  { value: 1, emoji: "😡", label: "Very Dissatisfied" },
  { value: 2, emoji: "😞", label: "Dissatisfied" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "😊", label: "Satisfied" },
  { value: 5, emoji: "😍", label: "Very Satisfied" },
];

export default function FeedbackForm() {
  const params = useParams(); // Get dynamic params
  const { username, invoiceNumber } = params;

  const [formData, setFormData] = useState({
    overallSatisfaction: 3,
    communication: 3,
    qualityOfService: 3,
    valueForMoney: 3,
    likelihoodToRecommend: 3,
    overallRating : 3,
    customFeedback: "",
    suggestions: "",
  });

  const payload = { formData, username, invoiceNumber };
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post("/api/submit-feedback", { data: payload });

      if (response.status == 400) {
      }
      toast.success("Feedback submitted successfully!");
    } catch (error) {}
  };

  const generateFeedbackAI = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overallSatisfaction: formData.overallSatisfaction,
          communication: formData.communication,
          qualityOfService: formData.qualityOfService,
          valueForMoney: formData.valueForMoney,
          likelihoodToRecommend: formData.likelihoodToRecommend,
          overallRating : formData.overallRating
        }),
      });

      const data = await response.json();

      if (response.ok) {
        handleChange("customFeedback", data.feedback);
        toast.success("AI-generated feedback added!");
      } else {
        toast.error(data.message || "Failed to generate feedback");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestionsAI = () => {
    handleChange("suggestions", "Offer more flexible payment options.");
    toast.success("AI-generated suggestion added!");
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Service Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Fields */}
          {[
            { key: "overallSatisfaction", label: "Overall Satisfaction" },
            { key: "communication", label: "Communication" },
            { key: "qualityOfService", label: "Quality of Service" },
            { key: "valueForMoney", label: "Value for Money" },
            { key: "likelihoodToRecommend", label: "Likelihood to Recommend" },
            { key: "overallRating", label: "Overall Rating" }
          ].map(({ key, label }) => (
            <div key={key}>
              <Label className="block mb-2 font-medium">{label}</Label>
              <div className="flex gap-3">
                {emojiOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange(key, option.value)}
                    className={`text-2xl transition-transform duration-200 ${
                      formData[key] === option.value
                        ? "scale-125 bg-gray-200 rounded-full"
                        : "opacity-70 hover:scale-110"
                    }`}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {emojiOptions.find((e) => e.value === formData[key])?.label}
              </span>
            </div>
          ))}

          {/* Custom Feedback */}
          <div className="relative">
            <Label className="block mb-2 font-medium">
              Additional Feedback
            </Label>
            <Textarea
              placeholder="Share your thoughts here..."
              value={formData.customFeedback}
              onChange={(e) => handleChange("customFeedback", e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              type="button"
              onClick={generateFeedbackAI}
              className="absolute top-1 right-1 p-2"
              variant="ghost"
              title="Generate Feedback using AI"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-gray-500 rounded-full"></div>
              ) : (
                <Wand2 size={20} />
              )}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="relative">
            <Label className="block mb-2 font-medium">Any Suggestions?</Label>
            <Input
              type="text"
              placeholder="Let us know how we can improve..."
              value={formData.suggestions}
              onChange={(e) => handleChange("suggestions", e.target.value)}
            />
            <Button
              type="button"
              onClick={generateSuggestionsAI}
              className="absolute top-1 right-1 p-2"
              variant="ghost"
              title="Generate Suggestion using AI"
            >
              <Sparkles size={20} />
            </Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
