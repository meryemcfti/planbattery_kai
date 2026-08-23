import { Prisma } from "@prisma/client";

type Gas = "CO2" | "CH4" | "N2O";

export type GasFactors = Partial<Record<Gas, Prisma.Decimal>>;
export type GwpValues = Partial<Record<Gas, Prisma.Decimal>>;

export type CalculationEngineInput = {
  normalizedConsumptionValue: Prisma.Decimal;
  factors: GasFactors;
  gwpValues: GwpValues;
};

export type CalculationEngineResult = {
  co2MassKg: Prisma.Decimal;
  ch4MassKg: Prisma.Decimal | null;
  n2oMassKg: Prisma.Decimal | null;
  co2Co2eKg: Prisma.Decimal;
  ch4Co2eKg: Prisma.Decimal | null;
  n2oCo2eKg: Prisma.Decimal | null;
  totalCo2eKg: Prisma.Decimal;
};

const zero = new Prisma.Decimal(0);

const multiply = (left: Prisma.Decimal, right: Prisma.Decimal | undefined) => {
  if (!right) {
    return null;
  }

  return left.mul(right);
};

export const calculateCo2e = (
  input: CalculationEngineInput
): CalculationEngineResult => {
  const co2Factor = input.factors.CO2;
  const co2Gwp = input.gwpValues.CO2;

  if (!co2Factor || !co2Gwp) {
    throw new Error("CO2 factor and GWP value are required");
  }

  const co2MassKg = input.normalizedConsumptionValue.mul(co2Factor);
  const ch4MassKg = multiply(input.normalizedConsumptionValue, input.factors.CH4);
  const n2oMassKg = multiply(input.normalizedConsumptionValue, input.factors.N2O);

  const co2Co2eKg = co2MassKg.mul(co2Gwp);
  const ch4Co2eKg = ch4MassKg?.mul(input.gwpValues.CH4 ?? zero) ?? null;
  const n2oCo2eKg = n2oMassKg?.mul(input.gwpValues.N2O ?? zero) ?? null;

  return {
    co2MassKg,
    ch4MassKg,
    n2oMassKg,
    co2Co2eKg,
    ch4Co2eKg,
    n2oCo2eKg,
    totalCo2eKg: co2Co2eKg.add(ch4Co2eKg ?? zero).add(n2oCo2eKg ?? zero)
  };
};
