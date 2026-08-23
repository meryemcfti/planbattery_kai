import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  activityEvidenceParamsSchema,
  createActivityEvidenceSchema
} from "./activity-evidence.schemas.js";
import { activityEvidenceService } from "./activity-evidence.service.js";

export const activityEvidenceRouter = Router({ mergeParams: true });

activityEvidenceRouter.use(requireTenantMember);

activityEvidenceRouter.get(
  "/",
  validate({ params: activityEvidenceParamsSchema }),
  asyncHandler(async (req, res) => {
    const evidence = await activityEvidenceService.list(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "activityId")
    );
    res.status(200).json({ data: evidence });
  })
);

activityEvidenceRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({
    params: activityEvidenceParamsSchema,
    body: createActivityEvidenceSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const evidence = await activityEvidenceService.create(
      tenantId,
      getRequiredParam(req, "activityId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "activity_evidence",
      entityId: evidence.id,
      tenantId,
      newValues: evidence
    });
    res.status(201).json({ data: evidence });
  })
);
