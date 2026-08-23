import { Router } from "express";

import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";

import { loginSchema } from "./auth.schemas.js";
import { authService } from "./auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const session = await authService.login(req.body);
    res.status(200).json({ data: session });
  })
);
