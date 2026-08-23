import { z } from "zod";

export const facilityParamsSchema = z.object({
  tenantId: z.string().uuid(),
  facilityId: z.string().uuid().optional()
});

export const createFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional(),
  city: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  address: z.string().optional()
});

export const updateFacilitySchema = createFacilitySchema.partial().extend({
  isActive: z.boolean().optional()
});
