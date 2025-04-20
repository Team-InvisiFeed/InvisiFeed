"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import MobileLogo from "@/components/MobileLogo";

// Zod schema for validation
const verifySchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters"),
});

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`/api/verify-code`, {
        username: params.username,
        code: otpValue,
      });

      toast(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Verification failed");
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">InvisiFeed</h1>
          <p className="text-lg text-gray-200">
            Verify your account to get started
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Secure and anonymous feedback system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Real-time insights and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Build a culture of trust and transparency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <MobileLogo />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md space-y-4"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Verify Your Account
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Enter the verification code sent to your email
              </p>
              <p className="text-[10px] text-gray-400">
                [Kindly check your spam folder if you don't see it in your
                inbox]
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="space-y-4"
            >
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-2 border-yellow-400/10 focus:border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || otp.join("").length !== 6}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
