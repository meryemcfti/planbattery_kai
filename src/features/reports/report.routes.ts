import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import { createReportSchema, reportParamsSchema } from "./report.schemas.js";
import { reportService } from "./report.service.js";

export const reportRouter = Router({ mergeParams: true });

reportRouter.use(requireTenantMember);

reportRouter.get(
  "/",
  validate({ params: reportParamsSchema }),
  asyncHandler(async (req, res) => {
    const reports = await reportService.list(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "assessmentId")
    );
    res.status(200).json({ data: reports });
  })
);

reportRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({ params: reportParamsSchema, body: createReportSchema }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const report = await reportService.create(
      tenantId,
      getRequiredParam(req, "assessmentId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "EXPORT",
      entityType: "reports",
      entityId: report.id,
      tenantId,
      newValues: report
    });
    res.status(201).json({ data: report });
  })
);
