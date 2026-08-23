import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { calculateCo2e } from "./calculation-engine.js";

describe("calculateCo2e", () => {
  it("calculates gas masses and total CO2e from normalized consumption", () => {
    const result = calculateCo2e({
      normalizedConsumptionValue: new Prisma.Decimal("100"),
      factors: {
        CO2: new Prisma.Decimal("2"),
        CH4: new Prisma.Decimal("0.01"),
        N2O: new Prisma.Decimal("0.001")
      },
      gwpValues: {
        CO2: new Prisma.Decimal("1"),
        CH4: new Prisma.Decimal("28"),
        N2O: new Prisma.Decimal("265")
      }
    });

    expect(result.co2MassKg.toString()).toBe("200");
    expect(result.ch4MassKg?.toString()).toBe("1");
    expect(result.n2oMassKg?.toString()).toBe("0.1");
    expect(result.co2Co2eKg.toString()).toBe("200");
    expect(result.ch4Co2eKg?.toString()).toBe("28");
    expect(result.n2oCo2eKg?.toString()).toBe("26.5");
    expect(result.totalCo2eKg.toString()).toBe("254.5");
  });

  it("requires CO2 factor and CO2 GWP", () => {
    expect(() =>
      calculateCo2e({
        normalizedConsumptionValue: new Prisma.Decimal("100"),
        factors: {},
        gwpValues: {}
      })
    ).toThrow("CO2 factor and GWP value are required");
  });
});
