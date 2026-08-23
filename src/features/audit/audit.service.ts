import type { Request } from "express";
import type { audit_action } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";

type AuditRecordInput = {
  action: audit_action;
  entityType: string;
  entityId?: string | null;
  tenantId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
};

const toAuditJson = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === "bigint") {
        return nestedValue.toString();
      }

      if (nestedValue instanceof Date) {
        return nestedValue.toISOString();
      }

      if (Prisma.Decimal.isDecimal(nestedValue)) {
        return nestedValue.toString();
      }

      return nestedValue;
    })
  ) as Prisma.InputJsonValue;
};

export const auditService = {
  listByTenant(tenantId: string) {
    return prisma.audit_logs.findMany({
      where: { tenant_id: tenantId },
      orderBy: { occurred_at: "desc" }
    });
  },

  recordFromRequest(req: Request, input: AuditRecordInput) {
    const oldValues = toAuditJson(input.oldValues);
    const newValues = toAuditJson(input.newValues);

    return prisma.audit_logs.create({
      data: {
        tenant_id: input.tenantId ?? null,
        user_id: req.authUser?.id ?? null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId ?? null,
        ...(oldValues !== undefined ? { old_values: oldValues } : {}),
        ...(newValues !== undefined ? { new_values: newValues } : {}),
        ip_address: req.ip ?? null,
        user_agent: req.get("user-agent") ?? null
      }
    });
  }
};
