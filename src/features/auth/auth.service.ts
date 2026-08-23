import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { z } from "zod";

import { env } from "../../config/env.js";
import { ApiError } from "../../errors/api-error.js";
import { ErrorCode } from "../../errors/error-code.js";
import { prisma } from "../../lib/prisma.js";

import type { loginSchema } from "./auth.schemas.js";

type LoginInput = z.infer<typeof loginSchema>;

type TokenPayload = {
  sub: string;
  email: string;
  platformRole: string;
};

const userSelect = {
  id: true,
  email: true,
  password_hash: true,
  full_name: true,
  platform_role: true,
  is_active: true
};

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.users.findUnique({
      where: { email: input.email },
      select: userSelect
    });

    if (!user || !user.is_active) {
      throw new ApiError(
        401,
        "Invalid credentials",
        undefined,
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "Invalid credentials",
        undefined,
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      platformRole: user.platform_role
    };
    const expiresIn = env.JWT_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >;
    const options: SignOptions = { expiresIn };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, options);

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        platformRole: user.platform_role
      }
    };
  }
};
