import type { z } from "zod";

import { prisma } from "../../lib/prisma.js";

import type {
  createEmissionFactorSchema,
  createEmissionFactorSourceSchema,
  updateEmissionFactorStatusSchema
} from "./emission-factor.schemas.js";

type CreateEmissionFactorSourceInput = z.infer<
  typeof createEmissionFactorSourceSchema
>;
type CreateEmissionFactorInput = z.infer<typeof createEmissionFactorSchema>;
type UpdateEmissionFactorStatusInput = z.infer<
  typeof updateEmissionFactorStatusSchema
>;

export const emissionFactorService = {
  listSources() {
    return prisma.emission_factor_sources.findMany({
      orderBy: [{ publication_year: "desc" }, { created_at: "desc" }]
    });
  },

  createSource(input: CreateEmissionFactorSourceInput) {
    return prisma.emission_factor_sources.create({
      data: {
        name: input.name,
        publisher: input.publisher,
        publication_year: input.publicationYear,
        version: input.version ?? null,
        source_url: input.sourceUrl ?? null,
        document_reference: input.documentReference ?? null,
        valid_from: input.validFrom ?? null,
        valid_to: input.validTo ?? null
      }
    });
  },

  listFactors() {
    return prisma.emission_factors.findMany({
      include: {
        source: true,
        input_unit: true,
        components: true
      },
      orderBy: { created_at: "desc" }
    });
  },

  createFactor(input: CreateEmissionFactorInput) {
    return prisma.emission_factors.create({
      data: {
        source_id: input.sourceId,
        activity_name: input.activityName,
        scope: input.scope,
        category: input.category,
        country_code: input.countryCode ?? null,
        input_unit_id: input.inputUnitId,
        valid_from: input.validFrom ?? null,
        valid_to: input.validTo ?? null,
        components: {
          create: input.components.map((component) => ({
            gas: component.gas,
            factor_value: component.factorValue,
            factor_unit: component.factorUnit
          }))
        }
      },
      include: {
        source: true,
        input_unit: true,
        components: true
      }
    });
  },

  async updateFactorStatus(id: string, input: UpdateEmissionFactorStatusInput) {
    const oldValue = await prisma.emission_factors.findUniqueOrThrow({
      where: { id },
      include: {
        source: true,
        input_unit: true,
        components: true
      }
    });

    const newValue = await prisma.emission_factors.update({
      where: { id },
      data: {
        is_active: input.isActive
      },
      include: {
        source: true,
        input_unit: true,
        components: true
      }
    });

    return { oldValue, newValue };
  }
};
