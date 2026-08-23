import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createFacilitySchema,
  facilityParamsSchema,
  updateFacilitySchema
} from "./facility.schemas.js";
import { facilityService } from "./facility.service.js";

export const facilityRouter = Router({ mergeParams: true });

facilityRouter.use(requireTenantMember);

facilityRouter.get(
  "/",
  validate({ params: facilityParamsSchema }),
  asyncHandler(async (req, res) => {
    const facilities = await facilityService.list(
      getRequiredParam(req, "tenantId")
    );
    res.status(200).json({ data: facilities });
  })
);

facilityRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({ params: facilityParamsSchema, body: createFacilitySchema }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const facility = await facilityService.create(
      tenantId,
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "facilities",
      entityId: facility.id,
      tenantId,
      newValues: facility
    });
    res.status(201).json({ data: facility });
  })
);

facilityRouter.get(
  "/:facilityId",
  validate({ params: facilityParamsSchema.required({ facilityId: true }) }),
  asyncHandler(async (req, res) => {
    const facility = await facilityService.getById(
      getRequiredParam(req, "tenantId"),
      getRequiredParam(req, "facilityId")
    );
    res.status(200).json({ data: facility });
  })
);

facilityRouter.patch(
  "/:facilityId",
  requireTenantRole(["COMPANY_ADMIN", "DATA_ENTRY"]),
  validate({
    params: facilityParamsSchema.required({ facilityId: true }),
    body: updateFacilitySchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await facilityService.update(
      tenantId,
      getRequiredParam(req, "facilityId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "facilities",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
