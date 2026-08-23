import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createGwpSetSchema,
  gwpSetParamsSchema,
  updateGwpSetStatusSchema
} from "./gwp-set.schemas.js";
import { gwpSetService } from "./gwp-set.service.js";

export const gwpSetRouter = Router();

gwpSetRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const gwpSets = await gwpSetService.list();
    res.status(200).json({ data: gwpSets });
  })
);

gwpSetRouter.post(
  "/",
  validate({ body: createGwpSetSchema }),
  asyncHandler(async (req, res) => {
    const gwpSet = await gwpSetService.create(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "gwp_sets",
      entityId: gwpSet.id,
      newValues: gwpSet
    });
    res.status(201).json({ data: gwpSet });
  })
);

gwpSetRouter.patch(
  "/:gwpSetId/status",
  validate({ params: gwpSetParamsSchema, body: updateGwpSetStatusSchema }),
  asyncHandler(async (req, res) => {
    const { oldValue, newValue } = await gwpSetService.updateStatus(
      getRequiredParam(req, "gwpSetId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "gwp_sets",
      entityId: newValue.id,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
