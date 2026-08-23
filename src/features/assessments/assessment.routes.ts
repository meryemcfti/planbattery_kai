import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  assessmentParamsSchema,
  attachFacilitiesSchema,
  createAssessmentSchema,
  updateAssessmentSchema
} from "./assessment.schemas.js";
import { assessmentService } from "./assessment.service.js";

export const assessmentRouter = Router({ mergeParams: true });

assessmentRouter.use(requireTenantMember);

assessmentRouter.get(
  "/",
  validate({ params: assessmentParamsSchema }),
  asyncHandler(async (req, res) => {
    const assessments = await assessmentService.list(
      getRequiredParam(req, "tenantId")
    );
    res.status(200).json({ data: assessments });
  })
);

assessmentRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({ params: assessmentParamsSchema, body: createAssessmentSchema }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const assessment = await assessmentService.create(
      tenantId,
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "carbon_assessments",
      entityId: assessment.id,
      tenantId,
      newValues: assessment
    });
    res.status(201).json({ data: assessment });
  })
);

assessmentRouter.get(
  "/:assessmentId",
  validate({ params: assessmentParamsSchema.required({ assessmentId: true }) }),
  asyncHandler(async (req, res) => {
    const assessment = await assessmentService.getById(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "assessmentId")
    );
    res.status(200).json({ data: assessment });
  })
);

assessmentRouter.patch(
  "/:assessmentId",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({
    params: assessmentParamsSchema.required({ assessmentId: true }),
    body: updateAssessmentSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await assessmentService.update(
      tenantId,
      getRequiredParam(req, "assessmentId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: newValue.status === "FINALIZED" ? "FINALIZE" : "UPDATE",
      entityType: "carbon_assessments",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);

assessmentRouter.post(
  "/:assessmentId/facilities",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({
    params: assessmentParamsSchema.required({ assessmentId: true }),
    body: attachFacilitiesSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await assessmentService.attachFacilities(
      tenantId,
      getRequiredParam(req, "assessmentId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "assessment_facilities",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
