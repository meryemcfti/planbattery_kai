import { prisma } from "../../lib/prisma.js";

import type { createTenantSchema, updateTenantSchema } from "./tenant.schemas.js";
import type { z } from "zod";

type CreateTenantInput = z.infer<typeof createTenantSchema>;
type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

export const tenantService = {
  list() {
    return prisma.tenants.findMany({
      orderBy: { created_at: "desc" }
    });
  },

  create(input: CreateTenantInput) {
    return prisma.tenants.create({
      data: {
        name: input.name,
        legal_name: input.legalName ?? null,
        slug: input.slug,
        tax_number: input.taxNumber ?? null,
        country_code: input.countryCode ?? null
      }
    });
  },

  getById(id: string) {
    return prisma.tenants.findUniqueOrThrow({
      where: { id }
    });
  },

  async update(id: string, input: UpdateTenantInput) {
    const oldValue = await prisma.tenants.findUniqueOrThrow({
      where: { id }
    });
    const newValue = await prisma.tenants.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.legalName !== undefined
          ? { legal_name: input.legalName }
          : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.taxNumber !== undefined
          ? { tax_number: input.taxNumber }
          : {}),
        ...(input.countryCode !== undefined
          ? { country_code: input.countryCode }
          : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
      }
    });

    return { oldValue, newValue };
  }
};
