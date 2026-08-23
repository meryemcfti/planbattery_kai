import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  calculationRunParamsSchema,
  calculationTenantParamsSchema,
  createCalculationRunSchema
} from "./calculation.schemas.js";
import { calculationService } from "./calculation.service.js";

export const calculationRouter = Router({ mergeParams: true });

calculationRouter.use(requireTenantMember);

calculationRouter.get(
  "/",
  validate({ params: calculationTenantParamsSchema }),
  asyncHandler(async (req, res) => {
    const runs = await calculationService.list(getRequiredParam(req, "tenantId"));
    res.status(200).json({ data: runs });
  })
);

calculationRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({
    params: calculationTenantParamsSchema,
    body: createCalculationRunSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const run = await calculationService.create(
      tenantId,
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CALCULATE",
      entityType: "calculation_runs",
      entityId: run.id,
      tenantId,
      newValues: run
    });
    res.status(201).json({ data: run });
  })
);

calculationRouter.get(
  "/:calculationRunId",
  validate({ params: calculationRunParamsSchema }),
  asyncHandler(async (req, res) => {
    const run = await calculationService.getById(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "calculationRunId")
    );
    res.status(200).json({ data: run });
  })
);
