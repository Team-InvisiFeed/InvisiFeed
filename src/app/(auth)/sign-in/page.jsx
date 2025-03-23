"use client";

// Import necessary modules and libraries
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating Zod validation with React Hook Form
import { useForm } from "react-hook-form"; // React Hook Form for handling forms
import { Form } from "@/components/ui/form"; // Custom Form component
import Link from "next/link"; // For client-side navigation in Next.js
import * as z from "zod"; // Zod for schema-based validation
import React, { useState } from "react"; // React hooks for state and lifecycle
import { useRouter } from "next/navigation"; // Next.js router for navigation

// import { useToast } from "@/hooks/use-toast"; // Custom toast notifications

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // UI components for form
import { Input } from "@/components/ui/input"; // Input component
import { Button } from "@/components/ui/button"; // Button component
import { signInSchema } from "@/schemas/signinSchema";
import { signIn, useSession } from "next-auth/react";
// import { signIn } from "next-auth/react";

// Main page component
function page() {
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag for form submission

  const { data: session } = useSession();
  const owner = session?.user;

  // Toast notifications for feedback
  // const { toast } = useToast();

  // Next.js router for navigation
  const router = useRouter();

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
      if (result.error == "CredentialsSignin") {
        // toast({
        //   title: "Login failed",
        //   description: "Incorrect username or password",
        //   variant: "destructive",
        // });
      } else {
        // toast({
        //   title: "Error",
        //   description: result.error,
        //   variant: "destructive",
        // });
      }
    }

    if (result?.url) {
      router.replace(result.url);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Card container */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {/* Heading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl mb-6">
            Join InvisiFeed
          </h1>
          {/* Subheading */}
          <p className="mb-4 text-gray-600">
            Sign in to start your anonymous adventure
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800">
                    Email/Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="focus:ring-2 focus:ring-gray-500 focus:outline-none bg-gray-100 text-gray-800 border-gray-300"
                      placeholder="Email/Username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800">Password</FormLabel>
                  <FormControl>
                    <Input
                      className="focus:ring-2 focus:ring-gray-500 focus:outline-none bg-gray-100 text-gray-800 border-gray-300"
                      type="password"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          </form>
        </Form>

        {/* Sign-in link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Not a member yet?{" "}
            <Link
              href="/register"
              className="text-black font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
