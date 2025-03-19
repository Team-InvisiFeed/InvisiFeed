import { z } from "zod";

export const orgNameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[A-Za-z0-9_]+$/, "Username must not contain special character");

export const signUpSchema = z.object({
  organizationName: orgNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
