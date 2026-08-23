import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type { createActivityEvidenceSchema } from "./activity-evidence.schemas.js";

type CreateActivityEvidenceInput = z.infer<typeof createActivityEvidenceSchema>;

export const activityEvidenceService = {
  async list(tenantId: string, activityId: string) {
    await prisma.natural_gas_activities.findFirstOrThrow({
      where: { id: activityId, tenant_id: tenantId },
      select: { id: true }
    });

    return prisma.activity_evidence.findMany({
      where: {
        tenant_id: tenantId,
        natural_gas_activity_id: activityId
      },
      orderBy: { created_at: "desc" }
    });
  },

  async create(
    tenantId: string,
    activityId: string,
    input: CreateActivityEvidenceInput
  ) {
    await prisma.natural_gas_activities.findFirstOrThrow({
      where: { id: activityId, tenant_id: tenantId },
      select: { id: true }
    });

    return prisma.activity_evidence.create({
      data: {
        tenant_id: tenantId,
        natural_gas_activity_id: activityId,
        evidence_type: input.evidenceType,
        original_file_name: input.originalFileName,
        storage_key: input.storageKey,
        mime_type: input.mimeType ?? null,
        file_size_bytes:
          input.fileSizeBytes !== undefined ? BigInt(input.fileSizeBytes) : null,
        checksum_sha256: input.checksumSha256 ?? null,
        uploaded_by_user_id: input.uploadedByUserId
      }
    });
  }
};
