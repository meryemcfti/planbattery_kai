import { Router } from "express";

import { requireTenantMember } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import { auditParamsSchema } from "./audit.schemas.js";
import { auditService } from "./audit.service.js";

export const auditRouter = Router({ mergeParams: true });

auditRouter.use(requireTenantMember);

auditRouter.get(
  "/",
  validate({ params: auditParamsSchema }),
  asyncHandler(async (req, res) => {
    const logs = await auditService.listByTenant(getRequiredParam(req, "tenantId"));
    res.status(200).json({ data: logs });
  })
);
