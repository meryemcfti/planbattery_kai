import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type {
  createGwpSetSchema,
  updateGwpSetStatusSchema
} from "./gwp-set.schemas.js";

type CreateGwpSetInput = z.infer<typeof createGwpSetSchema>;
type UpdateGwpSetStatusInput = z.infer<typeof updateGwpSetStatusSchema>;

export const gwpSetService = {
  list() {
    return prisma.gwp_sets.findMany({
      include: { values: true },
      orderBy: { created_at: "desc" }
    });
  },

  create(input: CreateGwpSetInput) {
    return prisma.gwp_sets.create({
      data: {
        name: input.name,
        publisher: input.publisher,
        version: input.version,
        publication_year: input.publicationYear ?? null,
        source_reference: input.sourceReference ?? null,
        values: {
          create: input.values.map((value) => ({
            gas: value.gas,
            gwp_value: value.gwpValue
          }))
        }
      },
      include: { values: true }
    });
  },

  async updateStatus(id: string, input: UpdateGwpSetStatusInput) {
    const oldValue = await prisma.gwp_sets.findUniqueOrThrow({
      where: { id },
      include: { values: true }
    });

    const newValue = await prisma.gwp_sets.update({
      where: { id },
      data: { is_active: input.isActive },
      include: { values: true }
    });

    return { oldValue, newValue };
  }
};
