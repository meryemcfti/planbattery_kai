import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createEmissionFactorSchema,
  createEmissionFactorSourceSchema,
  emissionFactorParamsSchema,
  updateEmissionFactorStatusSchema
} from "./emission-factor.schemas.js";
import { emissionFactorService } from "./emission-factor.service.js";

export const emissionFactorRouter = Router();

emissionFactorRouter.get(
  "/sources",
  asyncHandler(async (_req, res) => {
    const sources = await emissionFactorService.listSources();
    res.status(200).json({ data: sources });
  })
);

emissionFactorRouter.post(
  "/sources",
  validate({ body: createEmissionFactorSourceSchema }),
  asyncHandler(async (req, res) => {
    const source = await emissionFactorService.createSource(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "emission_factor_sources",
      entityId: source.id,
      newValues: source
    });
    res.status(201).json({ data: source });
  })
);

emissionFactorRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const factors = await emissionFactorService.listFactors();
    res.status(200).json({ data: factors });
  })
);

emissionFactorRouter.post(
  "/",
  validate({ body: createEmissionFactorSchema }),
  asyncHandler(async (req, res) => {
    const factor = await emissionFactorService.createFactor(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "emission_factors",
      entityId: factor.id,
      newValues: factor
    });
    res.status(201).json({ data: factor });
  })
);

emissionFactorRouter.patch(
  "/:factorId/status",
  validate({
    params: emissionFactorParamsSchema,
    body: updateEmissionFactorStatusSchema
  }),
  asyncHandler(async (req, res) => {
    const { oldValue, newValue } = await emissionFactorService.updateFactorStatus(
      getRequiredParam(req, "factorId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "emission_factors",
      entityId: newValue.id,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
