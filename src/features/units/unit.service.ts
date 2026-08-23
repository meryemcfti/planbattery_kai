import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type { createUnitSchema, updateUnitSchema } from "./unit.schemas.js";

type CreateUnitInput = z.infer<typeof createUnitSchema>;
type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export const unitService = {
  list() {
    return prisma.units.findMany({
      orderBy: { code: "asc" }
    });
  },

  create(input: CreateUnitInput) {
    return prisma.units.create({
      data: input
    });
  },

  getById(id: string) {
    return prisma.units.findUniqueOrThrow({
      where: { id }
    });
  },

  async update(id: string, input: UpdateUnitInput) {
    const oldValue = await prisma.units.findUniqueOrThrow({
      where: { id }
    });
    const newValue = await prisma.units.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.symbol !== undefined ? { symbol: input.symbol } : {}),
        ...(input.dimension !== undefined ? { dimension: input.dimension } : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
      }
    });

    return { oldValue, newValue };
  }
};
