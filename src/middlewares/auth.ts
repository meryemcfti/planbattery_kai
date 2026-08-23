import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import type { platform_role, tenant_role } from "@prisma/client";

import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";
import { ErrorCode } from "../errors/error-code.js";
import { prisma } from "../lib/prisma.js";
import { getRequiredParam } from "../utils/request-param.js";

type JwtPayload = {
  sub: string;
  email: string;
  platformRole: platform_role;
};

const readBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    throw new ApiError(
      401,
      "Authorization header is required",
      undefined,
      ErrorCode.AUTHENTICATION_REQUIRED
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(
      401,
      "Bearer token is required",
      undefined,
      ErrorCode.AUTHENTICATION_REQUIRED
    );
  }

  return token;
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readBearerToken(req.headers.authorization);
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.users.findFirst({
      where: {
        id: payload.sub,
        is_active: true
      },
      select: {
        id: true,
        email: true,
        platform_role: true
      }
    });

    if (!user) {
      throw new ApiError(
        401,
        "Invalid token subject",
        undefined,
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      platformRole: user.platform_role
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(
      new ApiError(
        401,
        "Invalid or expired token",
        undefined,
        ErrorCode.AUTH_INVALID_TOKEN
      )
    );
  }
};

export const requirePlatformAdmin: RequestHandler = (req, _res, next) => {
  if (!req.authUser) {
    next(
      new ApiError(
        401,
        "Authentication is required",
        undefined,
        ErrorCode.AUTHENTICATION_REQUIRED
      )
    );
    return;
  }

  if (req.authUser.platformRole !== "PLATFORM_ADMIN") {
    next(
      new ApiError(
        403,
        "Platform admin role is required",
        undefined,
        ErrorCode.AUTH_INSUFFICIENT_ROLE
      )
    );
    return;
  }

  next();
};

export const requireTenantMember: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.authUser) {
      throw new ApiError(
        401,
        "Authentication is required",
        undefined,
        ErrorCode.AUTHENTICATION_REQUIRED
      );
    }

    if (req.authUser.platformRole === "PLATFORM_ADMIN") {
      next();
      return;
    }

    const tenantId = getRequiredParam(req, "tenantId");
    const membership = await prisma.tenant_memberships.findFirst({
      where: {
        tenant_id: tenantId,
        user_id: req.authUser.id,
        is_active: true
      },
      select: {
        id: true,
        tenant_id: true,
        role: true
      }
    });

    if (!membership) {
      throw new ApiError(
        403,
        "Tenant membership is required",
        undefined,
        ErrorCode.AUTH_TENANT_MEMBERSHIP_REQUIRED
      );
    }

    req.tenantMembership = {
      id: membership.id,
      tenantId: membership.tenant_id,
      role: membership.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireTenantRole =
  (roles: tenant_role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.authUser) {
      next(
        new ApiError(
          401,
          "Authentication is required",
          undefined,
          ErrorCode.AUTHENTICATION_REQUIRED
        )
      );
      return;
    }

    if (req.authUser.platformRole === "PLATFORM_ADMIN") {
      next();
      return;
    }

    if (!req.tenantMembership) {
      next(
        new ApiError(
          403,
          "Tenant membership is required",
          undefined,
          ErrorCode.AUTH_TENANT_MEMBERSHIP_REQUIRED
        )
      );
      return;
    }

    if (!roles.includes(req.tenantMembership.role)) {
      next(
        new ApiError(
          403,
          "Insufficient tenant role",
          undefined,
          ErrorCode.AUTH_INSUFFICIENT_ROLE
        )
      );
      return;
    }

    next();
  };
