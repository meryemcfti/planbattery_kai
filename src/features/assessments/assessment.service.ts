import type { z } from "zod";

import { ApiError } from "../../errors/api-error.js";
import { ErrorCode } from "../../errors/error-code.js";
import { prisma } from "../../lib/prisma.js";

import type {
  attachFacilitiesSchema,
  createAssessmentSchema,
  updateAssessmentSchema
} from "./assessment.schemas.js";

type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
type AttachFacilitiesInput = z.infer<typeof attachFacilitiesSchema>;

export const assessmentService = {
  list(tenantId: string) {
    return prisma.carbon_assessments.findMany({
      where: { tenant_id: tenantId },
      include: {
        assessment_facilities: {
          include: { facility: true }
        }
      },
      orderBy: { created_at: "desc" }
    });
  },

  create(tenantId: string, input: CreateAssessmentInput) {
    return prisma.$transaction(async (tx) => {
      if (input.facilityIds.length > 0) {
        const facilityCount = await tx.facilities.count({
          where: {
            tenant_id: tenantId,
            id: { in: input.facilityIds }
          }
        });

        if (facilityCount !== input.facilityIds.length) {
          throw new ApiError(
            400,
            "One or more facilities do not belong to tenant",
            undefined,
            ErrorCode.TENANT_RELATION_INVALID
          );
        }
      }

      return tx.carbon_assessments.create({
        data: {
          tenant_id: tenantId,
          name: input.name,
          period_start: input.periodStart,
          period_end: input.periodEnd,
          created_by_user_id: input.createdByUserId,
          assessment_facilities: {
            createMany: {
              data: input.facilityIds.map((facilityId) => ({
                facility_id: facilityId
              })),
              skipDuplicates: true
            }
          }
        },
        include: {
          assessment_facilities: true
        }
      });
    });
  },

  getById(tenantId: string, id: string) {
    return prisma.carbon_assessments.findFirstOrThrow({
      where: { id, tenant_id: tenantId },
      include: {
        assessment_facilities: {
          include: { facility: true }
        },
        activities: true
      }
    });
  },

  async update(tenantId: string, id: string, input: UpdateAssessmentInput) {
    const oldValue = await prisma.carbon_assessments.findFirstOrThrow({
      where: { id, tenant_id: tenantId }
    });

    const newValue = await prisma.carbon_assessments.update({
      where: { id: oldValue.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.periodStart !== undefined
          ? { period_start: input.periodStart }
          : {}),
        ...(input.periodEnd !== undefined ? { period_end: input.periodEnd } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.finalizedByUserId !== undefined
          ? { finalized_by_user_id: input.finalizedByUserId }
          : {}),
        ...(input.status === "FINALIZED" ? { finalized_at: new Date() } : {})
      }
    });

    return { oldValue, newValue };
  },

  attachFacilities(tenantId: string, id: string, input: AttachFacilitiesInput) {
    return prisma.$transaction(async (tx) => {
      const assessment = await tx.carbon_assessments.findFirstOrThrow({
        where: { id, tenant_id: tenantId },
        select: { id: true }
      });
      const oldValue = await tx.carbon_assessments.findUniqueOrThrow({
        where: { id: assessment.id },
        include: {
          assessment_facilities: {
            include: { facility: true }
          }
        }
      });

      const facilityCount = await tx.facilities.count({
        where: {
          tenant_id: tenantId,
          id: { in: input.facilityIds }
        }
      });

      if (facilityCount !== input.facilityIds.length) {
        throw new ApiError(
          400,
          "One or more facilities do not belong to tenant",
          undefined,
          ErrorCode.TENANT_RELATION_INVALID
        );
      }

      await tx.assessment_facilities.createMany({
        data: input.facilityIds.map((facilityId) => ({
          assessment_id: assessment.id,
          facility_id: facilityId
        })),
        skipDuplicates: true
      });

      const newValue = await tx.carbon_assessments.findUniqueOrThrow({
        where: { id: assessment.id },
        include: {
          assessment_facilities: {
            include: { facility: true }
          }
        }
      });

      return { oldValue, newValue };
    });
  }
};
