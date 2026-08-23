import type { z } from "zod";

import { ApiError } from "../../errors/api-error.js";
import { ErrorCode } from "../../errors/error-code.js";
import { prisma } from "../../lib/prisma.js";

import type {
  createNaturalGasActivitySchema,
  updateNaturalGasActivitySchema,
  validateNaturalGasActivitySchema
} from "./natural-gas-activity.schemas.js";

type CreateNaturalGasActivityInput = z.infer<
  typeof createNaturalGasActivitySchema
>;
type UpdateNaturalGasActivityInput = z.infer<
  typeof updateNaturalGasActivitySchema
>;
type ValidateNaturalGasActivityInput = z.infer<
  typeof validateNaturalGasActivitySchema
>;

const assertTenantRelations = async (
  tenantId: string,
  assessmentId: string,
  facilityId: string
) => {
  const [assessment, facility] = await Promise.all([
    prisma.carbon_assessments.findFirst({
      where: { id: assessmentId, tenant_id: tenantId },
      select: { id: true }
    }),
    prisma.facilities.findFirst({
      where: { id: facilityId, tenant_id: tenantId },
      select: { id: true }
    })
  ]);

  if (!assessment) {
    throw new ApiError(
      400,
      "Assessment does not belong to tenant",
      undefined,
      ErrorCode.TENANT_RELATION_INVALID
    );
  }

  if (!facility) {
    throw new ApiError(
      400,
      "Facility does not belong to tenant",
      undefined,
      ErrorCode.TENANT_RELATION_INVALID
    );
  }
};

export const naturalGasActivityService = {
  list(tenantId: string) {
    return prisma.natural_gas_activities.findMany({
      where: { tenant_id: tenantId },
      include: {
        assessment: true,
        facility: true,
        unit: true,
        evidence: true
      },
      orderBy: { created_at: "desc" }
    });
  },

  async create(tenantId: string, input: CreateNaturalGasActivityInput) {
    await assertTenantRelations(tenantId, input.assessmentId, input.facilityId);

    return prisma.natural_gas_activities.create({
      data: {
        tenant_id: tenantId,
        assessment_id: input.assessmentId,
        facility_id: input.facilityId,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        consumption_value: input.consumptionValue,
        unit_id: input.unitId,
        source_type: input.sourceType,
        source_reference: input.sourceReference ?? null,
        invoice_number: input.invoiceNumber ?? null,
        supplier_name: input.supplierName ?? null,
        meter_number: input.meterNumber ?? null,
        notes: input.notes ?? null,
        entered_by_user_id: input.enteredByUserId
      }
    });
  },

  getById(tenantId: string, id: string) {
    return prisma.natural_gas_activities.findFirstOrThrow({
      where: { id, tenant_id: tenantId },
      include: {
        assessment: true,
        facility: true,
        unit: true,
        evidence: true,
        calculation_runs: {
          include: {
            result: true
          }
        }
      }
    });
  },

  async update(
    tenantId: string,
    id: string,
    input: UpdateNaturalGasActivityInput
  ) {
    const oldValue = await prisma.natural_gas_activities.findFirstOrThrow({
      where: { id, tenant_id: tenantId }
    });

    if (input.assessmentId || input.facilityId) {
      const current = await prisma.natural_gas_activities.findUniqueOrThrow({
        where: { id: oldValue.id },
        select: { assessment_id: true, facility_id: true }
      });

      await assertTenantRelations(
        tenantId,
        input.assessmentId ?? current.assessment_id,
        input.facilityId ?? current.facility_id
      );
    }

    const newValue = await prisma.natural_gas_activities.update({
      where: { id: oldValue.id },
      data: {
        ...(input.assessmentId !== undefined
          ? { assessment_id: input.assessmentId }
          : {}),
        ...(input.facilityId !== undefined
          ? { facility_id: input.facilityId }
          : {}),
        ...(input.periodStart !== undefined
          ? { period_start: input.periodStart }
          : {}),
        ...(input.periodEnd !== undefined ? { period_end: input.periodEnd } : {}),
        ...(input.consumptionValue !== undefined
          ? { consumption_value: input.consumptionValue }
          : {}),
        ...(input.unitId !== undefined ? { unit_id: input.unitId } : {}),
        ...(input.sourceType !== undefined
          ? { source_type: input.sourceType }
          : {}),
        ...(input.sourceReference !== undefined
          ? { source_reference: input.sourceReference }
          : {}),
        ...(input.invoiceNumber !== undefined
          ? { invoice_number: input.invoiceNumber }
          : {}),
        ...(input.supplierName !== undefined
          ? { supplier_name: input.supplierName }
          : {}),
        ...(input.meterNumber !== undefined
          ? { meter_number: input.meterNumber }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status !== undefined ? { status: input.status } : {})
      }
    });

    return { oldValue, newValue };
  },

  async validate(
    tenantId: string,
    id: string,
    input: ValidateNaturalGasActivityInput
  ) {
    const oldValue = await prisma.natural_gas_activities.findFirstOrThrow({
      where: { id, tenant_id: tenantId }
    });

    const newValue = await prisma.natural_gas_activities.update({
      where: { id: oldValue.id },
      data: {
        status: "VALIDATED",
        validated_by_user_id: input.validatedByUserId,
        validated_at: new Date()
      }
    });

    return { oldValue, newValue };
  }
};
