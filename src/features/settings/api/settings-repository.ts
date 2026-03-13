import { STORAGE_KEYS } from '@/shared/config/constants';
import { readStorage, writeStorage } from '@/shared/lib/storage';
import type { BudgetSettings } from '@/entities/budget/types';
import { defaultBudgetSettings } from '@/features/settings/model/settings-schema';

function normalize(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }

  return fallback;
}

function sanitize(payload: Partial<BudgetSettings>): BudgetSettings {
  return {
    monthlySalary: normalize(payload.monthlySalary, defaultBudgetSettings.monthlySalary),
    monthlyFixedExpenses: normalize(
      payload.monthlyFixedExpenses,
      defaultBudgetSettings.monthlyFixedExpenses
    ),
    otherMonthlyExpenses: normalize(
      payload.otherMonthlyExpenses,
      defaultBudgetSettings.otherMonthlyExpenses
    ),
    otherMonthlyIncome: normalize(payload.otherMonthlyIncome, defaultBudgetSettings.otherMonthlyIncome),
    monthlyVariableExpenses: normalize(
      payload.monthlyVariableExpenses,
      defaultBudgetSettings.monthlyVariableExpenses
    )
  };
}

export const settingsRepository = {
  async get(): Promise<BudgetSettings> {
    const stored = readStorage<Partial<BudgetSettings>>(STORAGE_KEYS.settings, defaultBudgetSettings);
    return sanitize(stored);
  },

  async update(payload: BudgetSettings): Promise<BudgetSettings> {
    const sanitized = sanitize(payload);
    writeStorage(STORAGE_KEYS.settings, sanitized);
    return sanitized;
  }
};

