import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '@/shared/config/constants';
import { settingsRepository } from '@/features/settings/api/settings-repository';

describe('settingsRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default settings when there is no stored data', async () => {
    const settings = await settingsRepository.get();

    expect(settings).toEqual({
      monthlySalary: 0,
      monthlyFixedExpenses: 0,
      otherMonthlyExpenses: 0,
      otherMonthlyIncome: 0,
      monthlyVariableExpenses: 0
    });
  });

  it('saves and reads settings from local storage', async () => {
    await settingsRepository.update({
      monthlySalary: 4500,
      monthlyFixedExpenses: 1200,
      otherMonthlyExpenses: 200,
      otherMonthlyIncome: 300,
      monthlyVariableExpenses: 650
    });

    const settings = await settingsRepository.get();
    expect(settings.monthlySalary).toBe(4500);
    expect(settings.monthlyVariableExpenses).toBe(650);
  });

  it('sanitizes invalid or negative stored values', async () => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        monthlySalary: -10,
        monthlyFixedExpenses: 'invalid',
        otherMonthlyExpenses: 80,
        otherMonthlyIncome: null,
        monthlyVariableExpenses: 120
      })
    );

    const settings = await settingsRepository.get();

    expect(settings).toEqual({
      monthlySalary: 0,
      monthlyFixedExpenses: 0,
      otherMonthlyExpenses: 80,
      otherMonthlyIncome: 0,
      monthlyVariableExpenses: 120
    });
  });
});

