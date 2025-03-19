import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(1, "Organisation name is required"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(10, "Phone number must be 10 digits"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Ye confirmPassword field pe error show karega
  });
