import { beforeEach, describe, expect, it } from 'vitest';
import { scenarioRepository } from '@/features/scenarios/api/scenario-repository';
import { STORAGE_KEYS } from '@/shared/config/constants';

const baseInput = {
  name: 'Test Scenario',
  initialCash: 1000,
  monthlySalary: 2000,
  offerAmount: 0,
  monthlyFixedExpenses: 700,
  monthlyVariableExpenses: 300,
  monthlyInvestmentContribution: 200,
  investmentAnnualReturnRate: 0.1,
  otherMonthlyIncome: 0,
  otherMonthlyExpenses: 0,
  horizonMonths: 12
};

describe('scenarioRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and lists scenarios from local storage', async () => {
    await scenarioRepository.create(baseInput);

    const scenarios = await scenarioRepository.list();

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.name).toBe('Test Scenario');
  });

  it('updates a stored scenario', async () => {
    const scenario = await scenarioRepository.create(baseInput);
    const updated = await scenarioRepository.update(scenario.id, {
      ...baseInput,
      name: 'Updated Scenario'
    });

    expect(updated.name).toBe('Updated Scenario');

    const found = await scenarioRepository.getById(scenario.id);
    expect(found?.name).toBe('Updated Scenario');
  });

  it('removes a scenario', async () => {
    const scenario = await scenarioRepository.create(baseInput);
    await scenarioRepository.remove(scenario.id);

    const scenarios = await scenarioRepository.list();
    expect(scenarios).toHaveLength(0);
  });

  it('falls back to empty payload when stored version is invalid', async () => {
    localStorage.setItem(
      STORAGE_KEYS.scenarios,
      JSON.stringify({
        version: 999,
        scenarios: [
          {
            id: 'legacy',
            createdAt: '2026-03-13T00:00:00.000Z',
            updatedAt: '2026-03-13T00:00:00.000Z',
            ...baseInput
          }
        ]
      })
    );

    const scenarios = await scenarioRepository.list();
    expect(scenarios).toHaveLength(0);
  });
});

