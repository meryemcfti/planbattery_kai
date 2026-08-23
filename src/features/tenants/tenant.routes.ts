import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requirePlatformAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createTenantSchema,
  tenantParamsSchema,
  updateTenantSchema
} from "./tenant.schemas.js";
import { tenantService } from "./tenant.service.js";

export const tenantRouter = Router();

tenantRouter.get(
  "/",
  requirePlatformAdmin,
  asyncHandler(async (_req, res) => {
    const tenants = await tenantService.list();
    res.status(200).json({ data: tenants });
  })
);

tenantRouter.post(
  "/",
  requirePlatformAdmin,
  validate({ body: createTenantSchema }),
  asyncHandler(async (req, res) => {
    const tenant = await tenantService.create(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "tenants",
      entityId: tenant.id,
      tenantId: tenant.id,
      newValues: tenant
    });
    res.status(201).json({ data: tenant });
  })
);

tenantRouter.get(
  "/:tenantId",
  requirePlatformAdmin,
  validate({ params: tenantParamsSchema }),
  asyncHandler(async (req, res) => {
    const tenant = await tenantService.getById(getRequiredParam(req, "tenantId"));
    res.status(200).json({ data: tenant });
  })
);

tenantRouter.patch(
  "/:tenantId",
  requirePlatformAdmin,
  validate({ params: tenantParamsSchema, body: updateTenantSchema }),
  asyncHandler(async (req, res) => {
    const { oldValue, newValue } = await tenantService.update(
      getRequiredParam(req, "tenantId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "tenants",
      entityId: newValue.id,
      tenantId: newValue.id,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
