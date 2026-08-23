import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createUnitSchema,
  unitParamsSchema,
  updateUnitSchema
} from "./unit.schemas.js";
import { unitService } from "./unit.service.js";

export const unitRouter = Router();

unitRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const units = await unitService.list();
    res.status(200).json({ data: units });
  })
);

unitRouter.post(
  "/",
  validate({ body: createUnitSchema }),
  asyncHandler(async (req, res) => {
    const unit = await unitService.create(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "units",
      entityId: unit.id,
      newValues: unit
    });
    res.status(201).json({ data: unit });
  })
);

unitRouter.get(
  "/:unitId",
  validate({ params: unitParamsSchema }),
  asyncHandler(async (req, res) => {
    const unit = await unitService.getById(getRequiredParam(req, "unitId"));
    res.status(200).json({ data: unit });
  })
);

unitRouter.patch(
  "/:unitId",
  validate({ params: unitParamsSchema, body: updateUnitSchema }),
  asyncHandler(async (req, res) => {
    const { oldValue, newValue } = await unitService.update(
      getRequiredParam(req, "unitId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "units",
      entityId: newValue.id,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
