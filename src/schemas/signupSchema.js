import { z } from "zod";

export const orgNameValidation = z
  .string()
  .min(2, "Organization Name must be at least 2 characters")
  .max(20, "Organization Name must be no more than 20 characters")
  .regex(
    /^[A-Za-z0-9_ ]+$/,
    "Organization Name must not contain special characters"
  );

export const signUpSchema = z.object({
  organizationName: orgNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
