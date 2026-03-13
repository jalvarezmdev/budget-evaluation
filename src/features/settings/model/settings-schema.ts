import { z } from 'zod';
import type { BudgetSettings } from '@/entities/budget/types';

const nonNegativeNumber = z.coerce.number().min(0, 'Debe ser mayor o igual a 0');

export const budgetSettingsSchema = z.object({
  monthlySalary: nonNegativeNumber,
  monthlyFixedExpenses: nonNegativeNumber,
  otherMonthlyExpenses: nonNegativeNumber,
  otherMonthlyIncome: nonNegativeNumber,
  monthlyVariableExpenses: nonNegativeNumber
});

export type BudgetSettingsForm = z.infer<typeof budgetSettingsSchema>;

export const defaultBudgetSettings: BudgetSettings = {
  monthlySalary: 0,
  monthlyFixedExpenses: 0,
  otherMonthlyExpenses: 0,
  otherMonthlyIncome: 0,
  monthlyVariableExpenses: 0
};

