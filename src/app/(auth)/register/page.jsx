"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IoIosArrowBack } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [homeLoading, setHomeLoading] = useState(false);
  const pathname = usePathname();

  // Show Password State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isNavigatingToVerify, setIsNavigatingToVerify] = useState(false);
  const [isNavigatingToGoogleAuth, setIsNavigatingToGoogleAuth] =
    useState(false);

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: true,
    message: "",
  });
  const usernameCheckTimeout = useRef(null);

  // ✅ Form Setup
  const form = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      businessName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ✅ Handle Next Step
  const handleNext = () => {
    if (step === 1) {
      const { businessName, email } = form.getValues();
      if (businessName.trim() !== "" && email.trim() !== "") {
        setTimeout(() => setStep(2), 0);
      } else {
        toast("Please fill all fields before proceeding.");
      }
    } else if (step === 2) {
      const { username } = form.getValues();
      if (username.trim() !== "" && usernameStatus.isAvailable) {
        setTimeout(() => setStep(3), 0);
      } else {
        toast("Please enter a valid username before proceeding.");
      }
    }
  };

  // ✅ Form Submit
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/register", data);
      toast(response.data.message);
      setIsNavigatingToVerify(true);
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      toast(error?.response?.data?.message || "Sign-up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add username availability check function
  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameStatus({ isChecking: false, isAvailable: true, message: "" });
      return;
    }

    try {
      const response = await axios.get(
        `/api/check-username-unique?username=${encodeURIComponent(username)}`
      );

      setUsernameStatus({
        isChecking: false,
        isAvailable: response.data.success,
        message: response.data.message,
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: error.response?.data?.message || "Error checking username",
      });
    }
  };

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setHomeLoading(true);
  };

  useEffect(() => {
    return () => {
      setHomeLoading(false);
    };
  }, [pathname]);

  // Add debounced username check
  const debouncedUsernameCheck = (username) => {
    setUsernameStatus((prev) => ({ ...prev, isChecking: true }));
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 1000); // 1 second delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  // Update Google sign in handler
  const handleGoogleSignIn = async (e) => {
    e.preventDefault(); // Prevent form submission
    setIsNavigatingToGoogleAuth(true)
    try {
      await signIn("google", {
        callbackUrl: "/user",
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  if (isNavigatingToVerify) {
    return <LoadingScreen />;
  }

  if (homeLoading) {
    return <LoadingScreen />;
  }
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
        <div className="max-w-md space-y-4">
          <Link href="/" onClick={() => handleNavigation("/")}>
            <h1 className="text-4xl font-extrabold tracking-tight cursor-pointer">
              InvisiFeed
            </h1>
          </Link>
          <p className="text-lg text-gray-200">
            Transform your business with honest feedback
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p>Secure and honest feedback system</p>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-4"
        >
          {/* Fixed Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Join InvisiFeed and start your journey
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNumber
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className="text-xs mt-1 text-gray-400">
                    {stepNumber === 1
                      ? "Business"
                      : stepNumber === 2
                      ? "Username"
                      : "Password"}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-800">
                    <motion.div
                      className="h-full bg-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ width: step > stepNumber ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter Business Name"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Enter Email"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-md text-gray-400">
                            Set up a unique username
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter Username"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  debouncedUsernameCheck(e.target.value);
                                }}
                                className={`bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 ${
                                  !usernameStatus.isAvailable && field.value
                                    ? "border-red-500"
                                    : ""
                                }`}
                              />
                              {field.value && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                  {usernameStatus.isChecking ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                  ) : !usernameStatus.isAvailable ? (
                                    <span className="text-xs text-red-500">
                                      {usernameStatus.message}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-green-400">
                                      Username available
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                {...field}
                                className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                {...field}
                                className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fixed Navigation Buttons */}
              <div className="space-y-4 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-full bg-transparent hover:bg-gray-800 text-gray-400 border border-gray-700 hover:text-white font-medium cursor-pointer h-9"
                  >
                    Back
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      isSubmitting ||
                      (step === 2 &&
                        (!usernameStatus.isAvailable ||
                          usernameStatus.isChecking))
                    }
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Next"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                )}

                {/* Google Sign Up Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-5 bg-white hover:bg-gray-300 text-black font-medium cursor-pointer h-9 shadow-lg rounded-lg transition-all duration-300 ease-in-out"
                >
                  {!isNavigatingToGoogleAuth ? (
                    <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>{" "}
                  </>
                  ) : (<>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Loading...
                  </>)}
                  
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already a user?{" "}
                    <button
                      onClick={() => {
                        setIsNavigatingToSignIn(true);
                        router.push("/sign-in");
                      }}
                      disabled={isNavigatingToSignIn}
                      className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center cursor-pointer"
                    >
                      {isNavigatingToSignIn ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
