import { z } from "zod";

export const tenantParamsSchema = z.object({
  tenantId: z.string().uuid()
});

export const createTenantSchema = z.object({
  name: z.string().min(1).max(200),
  legalName: z.string().max(255).optional(),
  slug: z.string().min(2).max(120),
  taxNumber: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional()
});

export const updateTenantSchema = createTenantSchema.partial().extend({
  isActive: z.boolean().optional()
});
