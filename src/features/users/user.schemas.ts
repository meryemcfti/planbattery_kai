import { z } from "zod";

export const userParamsSchema = z.object({
  userId: z.string().uuid()
});

export const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(150),
  platformRole: z.enum(["USER", "PLATFORM_ADMIN"]).default("USER")
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  platformRole: z.enum(["USER", "PLATFORM_ADMIN"]).optional(),
  isActive: z.boolean().optional()
});
