import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type {
  createTenantMembershipSchema,
  updateTenantMembershipSchema
} from "./tenant-membership.schemas.js";

type CreateTenantMembershipInput = z.infer<typeof createTenantMembershipSchema>;
type UpdateTenantMembershipInput = z.infer<typeof updateTenantMembershipSchema>;

export const tenantMembershipService = {
  list(tenantId: string) {
    return prisma.tenant_memberships.findMany({
      where: { tenant_id: tenantId },
      include: { user: true },
      orderBy: { created_at: "desc" }
    });
  },

  create(tenantId: string, input: CreateTenantMembershipInput) {
    return prisma.tenant_memberships.create({
      data: {
        tenant_id: tenantId,
        user_id: input.userId,
        role: input.role
      }
    });
  },

  async update(
    tenantId: string,
    id: string,
    input: UpdateTenantMembershipInput
  ) {
    const oldValue = await prisma.tenant_memberships.findFirstOrThrow({
      where: { id, tenant_id: tenantId },
    });

    const newValue = await prisma.tenant_memberships.update({
      where: { id: oldValue.id },
      data: {
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
      }
    });

    return { oldValue, newValue };
  }
};
