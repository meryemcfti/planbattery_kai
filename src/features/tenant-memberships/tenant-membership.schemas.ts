import { z } from "zod";

export const tenantMembershipParamsSchema = z.object({
  tenantId: z.string().uuid(),
  membershipId: z.string().uuid().optional()
});

export const createTenantMembershipSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["COMPANY_ADMIN", "DATA_ENTRY", "VIEWER"])
});

export const updateTenantMembershipSchema = z.object({
  role: z.enum(["COMPANY_ADMIN", "DATA_ENTRY", "VIEWER"]).optional(),
  isActive: z.boolean().optional()
});
