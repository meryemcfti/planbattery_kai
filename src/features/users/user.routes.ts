import { Router } from "express";

import { auditService } from "../audit/audit.service.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRequiredParam } from "../../utils/request-param.js";

import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema
} from "./user.schemas.js";
import { userService } from "./user.service.js";

export const userRouter = Router();

userRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await userService.list();
    res.status(200).json({ data: users });
  })
);

userRouter.post(
  "/",
  validate({ body: createUserSchema }),
  asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);
    await auditService.recordFromRequest(req, {
      action: "CREATE",
      entityType: "users",
      entityId: user.id,
      newValues: user
    });
    res.status(201).json({ data: user });
  })
);

userRouter.get(
  "/:userId",
  validate({ params: userParamsSchema }),
  asyncHandler(async (req, res) => {
    const user = await userService.getById(getRequiredParam(req, "userId"));
    res.status(200).json({ data: user });
  })
);

userRouter.patch(
  "/:userId",
  validate({ params: userParamsSchema, body: updateUserSchema }),
  asyncHandler(async (req, res) => {
    const { oldValue, newValue } = await userService.update(
      getRequiredParam(req, "userId"),
      req.body
    );
    await auditService.recordFromRequest(req, {
      action: "UPDATE",
      entityType: "users",
      entityId: newValue.id,
      oldValues: oldValue,
      newValues: newValue
    });
    res.status(200).json({ data: newValue });
  })
);
