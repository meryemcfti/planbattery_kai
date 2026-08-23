import { prisma } from "../../lib/prisma.js";

import type { createFacilitySchema, updateFacilitySchema } from "./facility.schemas.js";
import type { z } from "zod";

type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;

export const facilityService = {
  list(tenantId: string) {
    return prisma.facilities.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" }
    });
  },

  create(tenantId: string, input: CreateFacilityInput) {
    return prisma.facilities.create({
      data: {
        tenant_id: tenantId,
        name: input.name,
        code: input.code ?? null,
        country_code: input.countryCode ?? null,
        city: input.city ?? null,
        district: input.district ?? null,
        address: input.address ?? null
      }
    });
  },

  getById(tenantId: string, id: string) {
    return prisma.facilities.findFirstOrThrow({
      where: {
        id,
        tenant_id: tenantId
      }
    });
  },

  async update(tenantId: string, id: string, input: UpdateFacilityInput) {
    const oldValue = await prisma.facilities.findFirstOrThrow({
      where: { id, tenant_id: tenantId }
    });

    const newValue = await prisma.facilities.update({
      where: { id: oldValue.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.countryCode !== undefined
          ? { country_code: input.countryCode }
          : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.district !== undefined ? { district: input.district } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
      }
    });

    return { oldValue, newValue };
  }
};
