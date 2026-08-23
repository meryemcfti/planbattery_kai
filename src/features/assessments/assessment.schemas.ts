import { z } from "zod";

export const assessmentParamsSchema = z.object({
  tenantId: z.string().uuid(),
  assessmentId: z.string().uuid().optional()
});

export const createAssessmentSchema = z
  .object({
    name: z.string().min(1).max(200),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    createdByUserId: z.string().uuid(),
    facilityIds: z.array(z.string().uuid()).default([])
  })
  .refine((input) => input.periodEnd >= input.periodStart, {
    message: "periodEnd must be greater than or equal to periodStart",
    path: ["periodEnd"]
  });

export const updateAssessmentSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "FINALIZED", "ARCHIVED"]).optional(),
    finalizedByUserId: z.string().uuid().optional()
  })
  .refine(
    (input) =>
      !input.periodStart || !input.periodEnd || input.periodEnd >= input.periodStart,
    {
      message: "periodEnd must be greater than or equal to periodStart",
      path: ["periodEnd"]
    }
  );

export const attachFacilitiesSchema = z.object({
  facilityIds: z.array(z.string().uuid()).min(1)
});
