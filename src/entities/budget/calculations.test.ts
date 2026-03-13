import { describe, expect, it } from 'vitest';
import { evaluateScenario, projectScenario, rankScenarios } from '@/entities/budget/calculations';
import type { Scenario, ScenarioInput, VehicleScenario } from '@/entities/budget/types';

const baseInput: ScenarioInput = {
  name: 'Base',
  initialCash: 5_000,
  vehicleFinancing: {
    vehiclePrice: 20_000,
    financingPlanPercent: 80,
    downPaymentPercent: 20,
    monthlyInstallment: 400,
    financingPeriodMonths: 12,
    specialInstallments: []
  },
  financialProfileSnapshot: {
    monthlySalary: 3_000,
    monthlyFixedExpenses: 1_000,
    monthlyVariableExpenses: 500,
    otherMonthlyIncome: 200,
    otherMonthlyExpenses: 100
  }
};

function createVehicleScenario(
  id: string,
  overrides: Partial<ScenarioInput> = {}
): VehicleScenario {
  return {
    id,
    createdAt: '2026-03-13T00:00:00.000Z',
    updatedAt: '2026-03-13T00:00:00.000Z',
    modelVersion: 'vehicle-v2',
    ...baseInput,
    ...overrides
  };
}

describe('budget calculations v2', () => {
  it('projects base scenario with expected balances', () => {
    const projection = projectScenario(baseInput);
    const first = projection[0];
    const last = projection.at(-1);

    expect(projection).toHaveLength(12);
    expect(first?.monthlyFreeCash).toBe(1_200);
    expect(first?.cashBalance).toBe(2_200);
    expect(last?.cashBalance).toBe(15_400);
  });

  it('applies special installments only on configured months', () => {
    const projection = projectScenario({
      ...baseInput,
      vehicleFinancing: {
        ...baseInput.vehicleFinancing,
        specialInstallments: [{ id: 's1', month: 2, amount: 500 }]
      }
    });

    expect(projection[0]?.vehiclePayment).toBe(400);
    expect(projection[1]?.specialInstallmentAmount).toBe(500);
    expect(projection[1]?.vehiclePayment).toBe(900);
    expect(projection[2]?.vehiclePayment).toBe(400);
  });

  it('treats month 1 special installment as part of initial payment', () => {
    const projection = projectScenario({
      ...baseInput,
      vehicleFinancing: {
        ...baseInput.vehicleFinancing,
        specialInstallments: [{ id: 's-initial', month: 1, amount: 600 }]
      }
    });

    const firstMonth = projection[0];

    expect(firstMonth?.specialInstallmentAmount).toBe(0);
    expect(firstMonth?.vehiclePayment).toBe(400);
    expect(firstMonth?.cashBalance).toBe(1_600);
  });

  it('flags risk when down payment exceeds initial cash', () => {
    const evaluation = evaluateScenario({
      ...baseInput,
      initialCash: 1_000,
      vehicleFinancing: {
        ...baseInput.vehicleFinancing,
        vehiclePrice: 30_000,
        downPaymentPercent: 30,
        monthlyInstallment: 1_500
      }
    });

    expect(evaluation.minCashBalance).toBeLessThan(0);
    expect(evaluation.negativeMonths).toBeGreaterThan(0);
  });

  it('ranks scenarios prioritizing cashflow safety', () => {
    const safeScenario = createVehicleScenario('safe', {
      name: 'Seguro',
      vehicleFinancing: {
        ...baseInput.vehicleFinancing,
        monthlyInstallment: 300
      }
    });

    const riskyScenario = createVehicleScenario('risky', {
      name: 'Riesgoso',
      initialCash: 0,
      vehicleFinancing: {
        ...baseInput.vehicleFinancing,
        monthlyInstallment: 2_300,
        downPaymentPercent: 40,
        vehiclePrice: 35_000
      }
    });

    const legacyScenario: Scenario = {
      id: 'legacy',
      createdAt: '2026-03-13T00:00:00.000Z',
      updatedAt: '2026-03-13T00:00:00.000Z',
      modelVersion: 'legacy-v1',
      name: 'Legacy',
      initialCash: 0,
      legacyData: {}
    };

    const ranking = rankScenarios([safeScenario, riskyScenario, legacyScenario]);

    expect(ranking).toHaveLength(2);
    expect(ranking.map((item) => item.scenarioId)).toEqual(['safe', 'risky']);
    expect(ranking[0]?.rank).toBe(1);
  });
});
