import { beforeEach, describe, expect, it } from 'vitest';
import { scenarioRepository } from '@/features/scenarios/api/scenario-repository';
import { STORAGE_KEYS } from '@/shared/config/constants';
import { isVehicleScenario } from '@/entities/budget/types';

const baseInput = {
  name: 'Oferta SUV',
  initialCash: 8_000,
  vehicleFinancing: {
    vehiclePrice: 35_000,
    financingPlanPercent: 75,
    downPaymentPercent: 25,
    monthlyInstallment: 650,
    financingPeriodMonths: 60,
    specialInstallments: [{ id: 'sp-1', month: 12, amount: 1_200 }]
  },
  financialProfileSnapshot: {
    monthlySalary: 4_000,
    monthlyFixedExpenses: 1_200,
    monthlyVariableExpenses: 700,
    otherMonthlyIncome: 0,
    otherMonthlyExpenses: 150
  },
  vehicleImageDataUrl: 'data:image/png;base64,abc123'
};

describe('scenarioRepository', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.scenarios);
    localStorage.removeItem(STORAGE_KEYS.meta);
    localStorage.removeItem(STORAGE_KEYS.settings);
  });

  it('creates and lists scenarios from local storage', async () => {
    await scenarioRepository.create(baseInput);

    const scenarios = await scenarioRepository.list();

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.name).toBe('Oferta SUV');
    expect(isVehicleScenario(scenarios[0]!)).toBe(true);
  });

  it('updates a stored scenario', async () => {
    const scenario = await scenarioRepository.create(baseInput);
    const updated = await scenarioRepository.update(scenario.id, {
      ...baseInput,
      name: 'Oferta SUV Actualizada'
    });

    expect(updated.name).toBe('Oferta SUV Actualizada');

    const found = await scenarioRepository.getById(scenario.id);
    expect(found?.name).toBe('Oferta SUV Actualizada');
  });

  it('removes a scenario', async () => {
    const scenario = await scenarioRepository.create(baseInput);
    await scenarioRepository.remove(scenario.id);

    const scenarios = await scenarioRepository.list();
    expect(scenarios).toHaveLength(0);
  });

  it('normalizes stored legacy scenarios without romper lectura', async () => {
    localStorage.setItem(
      STORAGE_KEYS.scenarios,
      JSON.stringify({
        version: 999,
        scenarios: [
          {
            id: 'legacy',
            createdAt: '2026-03-13T00:00:00.000Z',
            updatedAt: '2026-03-13T00:00:00.000Z',
            name: 'Escenario viejo',
            initialCash: 500,
            monthlySalary: 1000
          }
        ]
      })
    );

    const scenarios = await scenarioRepository.list();
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.modelVersion).toBe('legacy-v1');
  });
});
