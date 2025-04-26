"use client";

// Import necessary modules and libraries
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating Zod validation with React Hook Form
import { useForm } from "react-hook-form"; // React Hook Form for handling forms
import { Form } from "@/components/ui/form"; // Custom Form component
import Link from "next/link"; // For client-side navigation in Next.js
import React, { useState, Suspense, useEffect } from "react"; // React hooks for state and lifecycle
import { useRouter, useSearchParams } from "next/navigation"; // Next.js router for navigation
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"; // UI components for form
import { Input } from "@/components/ui/input"; // Input component
import { Button } from "@/components/ui/button"; // Button component
import { signInSchema } from "@/schemas/signinSchema";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MobileLogo from "@/components/MobileLogo";

function SignInContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigatingToRegister, setIsNavigatingToRegister] = useState(false);
  const searchParams = useSearchParams();
  const [isNavigatingToForgotPassword, setIsNavigatingToForgotPassword] =
    useState(false);
  const { data: session } = useSession();
  const username = session?.user?.username;
  const router = useRouter();

  // Check for token expiration
  useEffect(() => {
    if (session?.accessToken) {
      const checkTokenExpiry = () => {
        const now = Date.now();
        if (now > session.refreshTokenExpiry) {
          signOut({ redirect: true, callbackUrl: "/sign-in" });
        }
      };

      // Check every second
      const interval = setInterval(checkTokenExpiry, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Setting up React Hook Form with Zod validation schema
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true); // Indicate that form submission is in progress

    const result = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error("Incorrect username or password");
        setIsSubmitting(false);
      } else if (result.error.startsWith("UNVERIFIED_USER:")) {
        // Extract username from error message
        const username = result.error.split(":")[1];
        // Redirect to verification page
        router.push(`/verify/${username}`);
        setIsSubmitting(false);
      } else {
        toast.error(result.error);
        setIsSubmitting(false);
      }
    }

    router.replace(`/user/${result?.user?.username}`);
  };

  const error = searchParams.get("error");
  
  if (error === "DIFFERENT_SIGNIN_METHOD") {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Section with Gradient */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
          <div className="max-w-md space-y-4">
            <h1
              className="text-4xl font-extrabold tracking-tight cursor-pointer"
              onClick={() => router.push("/")}
            >
              InvisiFeed
            </h1>
            <p className="text-lg text-gray-200">
              Welcome back! Sign in to continue your journey
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

        {/* Right Section with Error Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0A0A0A]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Different Sign-in Method
              </h1>
              <p className="text-gray-400">
                You signed up using credentials. Please use the same method to
                sign in.
              </p>
            </div>

            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
            >
              Sign in with credentials
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error === "ACCOUNT_DELETED") {
    const remainingDays = searchParams.get("remainingDays");
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Section with Gradient */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
          <div className="max-w-md space-y-4">
            <h1
              className="text-4xl font-extrabold tracking-tight cursor-pointer"
              onClick={() => router.push("/")}
            >
              InvisiFeed
            </h1>
            <p className="text-lg text-gray-200">
              Welcome back! Sign in to continue your journey
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

        {/* Right Section with Error Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0A0A0A]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Account Deleted
              </h1>
              <p className="text-gray-400">
                Your account has been deleted. Please try again after {remainingDays} days.
              </p>
            </div>

            <Button
              onClick={() => router.push("/register")}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
            >
              Create a new account
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Update Google sign in handler
  const handleGoogleSignIn = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // After successful sign-in, redirect to user page
      router.push(`/user/${result?.user?.username}`);
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
        <div className="max-w-md space-y-4">
          <h1
            className="text-4xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => router.push("/")}
          >
            InvisiFeed
          </h1>
          <p className="text-lg text-gray-200">
            Welcome back! Sign in to continue your journey
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
                Welcome Back
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Sign in to your account
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  name="identifier"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email/Username"
                          {...field}
                          className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
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

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsNavigatingToForgotPassword(true);
                      router.push("/forgot-password");
                    }}
                    className={`text-sm cursor-pointer text-yellow-400 hover:text-yellow-300`}
                    disabled={isNavigatingToForgotPassword} // Disable button during loading
                  >
                    {isNavigatingToForgotPassword
                      ? "Loading..."
                      : "Forgot password?"}
                  </button>
                </div>

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
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-yellow-400/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0A0A0A] text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button" // Add type="button" to prevent form submission
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-2 px-6 py-5 bg-transparent hover:bg-[#000000ab] text-white font-medium cursor-pointer h-9 shadow-lg hover:shadow-yellow-500/10 rounded-lg border-[#161616] border-[0.001rem] transition-all duration-300 ease-in-out"
            >
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
              <span>Continue with Google</span>
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setIsNavigatingToRegister(true);
                    router.push("/register");
                  }}
                  disabled={isNavigatingToRegister}
                  className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center cursor-pointer"
                >
                  {isNavigatingToRegister ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

export default Page;
