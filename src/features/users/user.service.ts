import bcrypt from "bcryptjs";
import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type { createUserSchema, updateUserSchema } from "./user.schemas.js";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

const userSelect = {
  id: true,
  email: true,
  full_name: true,
  platform_role: true,
  is_active: true,
  last_login_at: true,
  created_at: true,
  updated_at: true
};

export const userService = {
  list() {
    return prisma.users.findMany({
      select: userSelect,
      orderBy: { created_at: "desc" }
    });
  },

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.users.create({
      data: {
        email: input.email,
        password_hash: passwordHash,
        full_name: input.fullName,
        platform_role: input.platformRole
      },
      select: userSelect
    });
  },

  getById(id: string) {
    return prisma.users.findUniqueOrThrow({
      where: { id },
      select: userSelect
    });
  },

  async update(id: string, input: UpdateUserInput) {
    const oldValue = await prisma.users.findUniqueOrThrow({
      where: { id },
      select: userSelect
    });
    const newValue = await prisma.users.update({
      where: { id },
      data: {
        ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
        ...(input.platformRole !== undefined
          ? { platform_role: input.platformRole }
          : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
      },
      select: userSelect
    });

    return { oldValue, newValue };
  }
};
