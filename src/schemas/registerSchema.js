import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username must be atmost 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");


export const registerSchema = z
  .object({
    username: usernameValidation,
    organizationName: z.string().min(1, "Organisation name is required"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(10, "Phone number must be 10 digits"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Ye confirmPassword field pe error show karega
  });
