import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { requireTenantMember, requireTenantRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createTenantMembershipSchema,
  tenantMembershipParamsSchema,
  updateTenantMembershipSchema
} from "./tenant-membership.schemas.js";
import { tenantMembershipService } from "./tenant-membership.service.js";

export const tenantMembershipRouter = Router({ mergeParams: true });

tenantMembershipRouter.use(requireTenantMember);

tenantMembershipRouter.get(
  "/",
  validate({ params: tenantMembershipParamsSchema }),
  asyncHandler(async (req, res) => {
    const memberships = await tenantMembershipService.list(
      getRequiredParam(req, "tenantId")
    );
    res.status(200).json({ data: memberships });
  })
);

tenantMembershipRouter.post(
  "/",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({
    params: tenantMembershipParamsSchema,
    body: createTenantMembershipSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const membership = await tenantMembershipService.create(
      tenantId,
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "tenant_memberships",
      entityId: membership.id,
      tenantId,
      newValues: membership
    });
    res.status(201).json({ data: membership });
  })
);

tenantMembershipRouter.patch(
  "/:membershipId",
  requireTenantRole(["COMPANY_ADMIN"]),
  validate({
    params: tenantMembershipParamsSchema.required({ membershipId: true }),
    body: updateTenantMembershipSchema
  }),
  asyncHandler(async (req, res) => {
    const tenantId = getRequiredParam(req, "tenantId");
    const { oldValue, newValue } = await tenantMembershipService.update(
      tenantId,
      getRequiredParam(req, "membershipId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "tenant_memberships",
      entityId: newValue.id,
      tenantId,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
