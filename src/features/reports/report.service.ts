import type { z } from "zod";

import { ApiError } from "../../errors/api-error.js";
import { ErrorCode } from "../../errors/error-code.js";
import { prisma } from "../../lib/prisma.js";

import type { createReportSchema } from "./report.schemas.js";

type CreateReportInput = z.infer<typeof createReportSchema>;

export const reportService = {
  async list(tenantId: string, assessmentId: string) {
    await prisma.carbon_assessments.findFirstOrThrow({
      where: { id: assessmentId, tenant_id: tenantId },
      select: { id: true }
    });

    return prisma.reports.findMany({
      where: {
        tenant_id: tenantId,
        assessment_id: assessmentId
      },
      orderBy: { report_version: "desc" }
    });
  },

  create(tenantId: string, assessmentId: string, input: CreateReportInput) {
    return prisma.$transaction(async (tx) => {
      const assessment = await tx.carbon_assessments.findFirstOrThrow({
        where: { id: assessmentId, tenant_id: tenantId },
        select: { id: true, status: true }
      });

      if (assessment.status !== "FINALIZED") {
        throw new ApiError(
          409,
          "Only finalized assessments can be reported",
          undefined,
          ErrorCode.CONFLICT
        );
      }

      const latestReport = await tx.reports.findFirst({
        where: { assessment_id: assessment.id },
        orderBy: { report_version: "desc" },
        select: { report_version: true }
      });
      const nextVersion = (latestReport?.report_version ?? 0) + 1;
      const isReady = Boolean(input.fileName && input.storageKey);

      return tx.reports.create({
        data: {
          tenant_id: tenantId,
          assessment_id: assessment.id,
          status: isReady ? "READY" : "GENERATING",
          report_version: nextVersion,
          file_name: input.fileName ?? null,
          storage_key: input.storageKey ?? null,
          generated_by_user_id: input.generatedByUserId ?? null,
          generated_at: isReady ? new Date() : null
        }
      });
    });
  }
};
