import type {
  calculation_factor_snapshots,
  calculation_input_snapshots,
  calculation_results
} from "@prisma/client";
import type { z } from "zod";

import { ApiError } from "../../errors/api-error.js";
import { ErrorCode } from "../../errors/error-code.js";
import { prisma } from "../../lib/prisma.js";

import { calculateCo2e } from "./calculation-engine.js";
import type { GasFactors, GwpValues } from "./calculation-engine.js";
import type { CalculationEngineResult } from "./calculation-engine.js";
import type { createCalculationRunSchema } from "./calculation.schemas.js";

type CreateCalculationRunInput = z.infer<typeof createCalculationRunSchema>;

const ENGINE_VERSION = "natural-gas-v1";

type Gas = "CO2" | "CH4" | "N2O";

const keyByGas = <T extends { gas: Gas }>(values: T[]) =>
  values.reduce<Partial<Record<Gas, T>>>((accumulator, value) => {
    accumulator[value.gas] = value;
    return accumulator;
  }, {});

export const calculationService = {
  list(tenantId: string) {
    return prisma.calculation_runs.findMany({
      where: { tenant_id: tenantId },
      include: {
        activity: true,
        emission_factor: true,
        gwp_set: true,
        input_snapshot: true,
        factor_snapshot: true,
        result: true
      },
      orderBy: { created_at: "desc" }
    });
  },

  getById(tenantId: string, id: string) {
    return prisma.calculation_runs.findFirstOrThrow({
      where: { id, tenant_id: tenantId },
      include: {
        activity: true,
        emission_factor: {
          include: {
            source: true,
            components: true,
            input_unit: true
          }
        },
        gwp_set: {
          include: { values: true }
        },
        input_snapshot: true,
        factor_snapshot: true,
        result: true
      }
    });
  },

  async create(tenantId: string, input: CreateCalculationRunInput) {
    const activity = await prisma.natural_gas_activities.findFirstOrThrow({
      where: {
        id: input.naturalGasActivityId,
        tenant_id: tenantId
      },
      include: {
        assessment: true,
        facility: true,
        unit: true
      }
    });

    if (activity.status !== "VALIDATED") {
      throw new ApiError(
        409,
        "Only validated activities can be calculated",
        undefined,
        ErrorCode.CONFLICT
      );
    }

    const [emissionFactor, gwpSet] = await Promise.all([
      prisma.emission_factors.findFirstOrThrow({
        where: {
          id: input.emissionFactorId,
          is_active: true
        },
        include: {
          source: true,
          input_unit: true,
          components: true
        }
      }),
      prisma.gwp_sets.findFirstOrThrow({
        where: {
          id: input.gwpSetId,
          is_active: true
        },
      include: { values: true }
      })
    ]);

    const run = await prisma.calculation_runs.create({
      data: {
        tenant_id: tenantId,
        assessment_id: activity.assessment_id,
        natural_gas_activity_id: activity.id,
        emission_factor_id: emissionFactor.id,
        gwp_set_id: gwpSet.id,
        calculation_engine_version: ENGINE_VERSION,
        status: "PENDING",
        initiated_by_user_id: input.initiatedByUserId ?? null
      }
    });

    const failRun = async (message: string): Promise<never> => {
      await prisma.calculation_runs.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          error_message: message,
          calculated_at: new Date()
        }
      });

      throw new ApiError(409, message, undefined, ErrorCode.CALCULATION_FAILED);
    };

    if (emissionFactor.input_unit_id !== activity.unit_id) {
      await failRun(
        "Activity unit must match emission factor input unit before calculation"
      );
    }

    if (emissionFactor.scope !== "SCOPE_1") {
      await failRun("Natural gas calculation requires SCOPE_1 factor");
    }

    if (emissionFactor.category !== "STATIONARY_COMBUSTION") {
      await failRun(
        "Natural gas calculation requires STATIONARY_COMBUSTION factor"
      );
    }

    const factorComponents = keyByGas(emissionFactor.components);
    const gwpValues = keyByGas(gwpSet.values);
    const co2Factor = factorComponents.CO2?.factor_value;
    const co2Gwp = gwpValues.CO2?.gwp_value;

    if (!co2Factor) {
      await failRun("CO2 factor and GWP value are required");
    }

    if (!co2Gwp) {
      await failRun("CO2 factor and GWP value are required");
    }

    const requiredCo2Factor = co2Factor as NonNullable<typeof co2Factor>;
    const requiredCo2Gwp = co2Gwp as NonNullable<typeof co2Gwp>;
    const factors: GasFactors = {
      CO2: requiredCo2Factor,
      ...(factorComponents.CH4 ? { CH4: factorComponents.CH4.factor_value } : {}),
      ...(factorComponents.N2O ? { N2O: factorComponents.N2O.factor_value } : {})
    };
    const gwps: GwpValues = {
      CO2: requiredCo2Gwp,
      ...(gwpValues.CH4 ? { CH4: gwpValues.CH4.gwp_value } : {}),
      ...(gwpValues.N2O ? { N2O: gwpValues.N2O.gwp_value } : {})
    };

    let result: CalculationEngineResult;

    try {
      result = calculateCo2e({
        normalizedConsumptionValue: activity.consumption_value,
        factors,
        gwpValues: gwps
      });
    } catch (error) {
      await failRun(
        error instanceof Error ? error.message : "Calculation failed"
      );
    }

    return prisma.$transaction(async (tx) => {
      const inputSnapshot: calculation_input_snapshots =
        await tx.calculation_input_snapshots.create({
          data: {
            calculation_run_id: run.id,
            consumption_value: activity.consumption_value,
            consumption_unit: activity.unit.code,
            normalized_consumption_value: activity.consumption_value,
            normalized_unit: emissionFactor.input_unit.code,
            activity_period_start: activity.period_start,
            activity_period_end: activity.period_end,
            facility_name: activity.facility.name
          }
        });

      const factorSnapshot: calculation_factor_snapshots =
        await tx.calculation_factor_snapshots.create({
          data: {
            calculation_run_id: run.id,
            factor_source_name: emissionFactor.source.name,
            factor_source_version: emissionFactor.source.version ?? null,
            publication_year: emissionFactor.source.publication_year,
            input_unit: emissionFactor.input_unit.code,
            co2_factor: requiredCo2Factor,
            ch4_factor: factorComponents.CH4?.factor_value ?? null,
            n2o_factor: factorComponents.N2O?.factor_value ?? null,
            co2_gwp: requiredCo2Gwp,
            ch4_gwp: gwpValues.CH4?.gwp_value ?? null,
            n2o_gwp: gwpValues.N2O?.gwp_value ?? null
          }
        });

      const calculationResult: calculation_results =
        await tx.calculation_results.create({
          data: {
            calculation_run_id: run.id,
            co2_mass_kg: result.co2MassKg,
            ch4_mass_kg: result.ch4MassKg,
            n2o_mass_kg: result.n2oMassKg,
            co2_co2e_kg: result.co2Co2eKg,
            ch4_co2e_kg: result.ch4Co2eKg,
            n2o_co2e_kg: result.n2oCo2eKg,
            total_co2e_kg: result.totalCo2eKg,
            scope: emissionFactor.scope,
            category: emissionFactor.category
          }
        });

      const updatedRun = await tx.calculation_runs.update({
        where: { id: run.id },
        data: {
          status: "SUCCESS",
          calculated_at: new Date()
        }
      });

      await tx.natural_gas_activities.update({
        where: { id: activity.id },
        data: { status: "CALCULATED" }
      });

      return {
        ...updatedRun,
        input_snapshot: inputSnapshot,
        factor_snapshot: factorSnapshot,
        result: calculationResult
      };
    });
  }
};
