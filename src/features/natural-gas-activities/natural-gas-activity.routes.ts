import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createNaturalGasActivitySchema,
  naturalGasActivityParamsSchema,
  updateNaturalGasActivitySchema,
  validateNaturalGasActivitySchema
} from "./natural-gas-activity.schemas.js";
import { naturalGasActivityService } from "./natural-gas-activity.service.js";

export const naturalGasActivityRouter = Router({ mergeParams: true });

naturalGasActivityRouter.use(requireTenantMember);

naturalGasActivityRouter.get(
  "/",
  validate({ params: naturalGasActivityParamsSchema }),
  asyncHandler(async (req, res) => {
    const activities = await naturalGasActivityService.list(
      getRequiredParam(req, "tenantId")
    );
    res.status(200).json({ data: activities });
  })
);

naturalGasActivityRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({
    params: naturalGasActivityParamsSchema,
    body: createNaturalGasActivitySchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const activity = await naturalGasActivityService.create(
      tenantId,
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "natural_gas_activities",
      entityId: activity.id,
      tenantId,
      newValues: activity
    });
    res.status(201).json({ data: activity });
  })
);

naturalGasActivityRouter.get(
  "/:activityId",
  validate({
    params: naturalGasActivityParamsSchema.required({ activityId: true })
  }),
  asyncHandler(async (req, res) => {
    const activity = await naturalGasActivityService.getById(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "activityId")
    );
    res.status(200).json({ data: activity });
  })
);

naturalGasActivityRouter.patch(
  "/:activityId",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({
    params: naturalGasActivityParamsSchema.required({ activityId: true }),
    body: updateNaturalGasActivitySchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await naturalGasActivityService.update(
      tenantId,
      getRequiredParam(req, "activityId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "natural_gas_activities",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);

naturalGasActivityRouter.post(
  "/:activityId/validate",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({
    params: naturalGasActivityParamsSchema.required({ activityId: true }),
    body: validateNaturalGasActivitySchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await naturalGasActivityService.validate(
      tenantId,
      getRequiredParam(req, "activityId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "natural_gas_activities",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
