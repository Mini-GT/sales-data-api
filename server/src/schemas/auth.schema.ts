import { z } from "zod";

// User Registration Schema
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email().min(6, "Email must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// User Login Schema
export const loginSchema = z.object({
  email: z.email().trim().min(6, "Email too short"),
  password: z.string().trim().min(6, "Password too short"),
});

// Type Inference for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
