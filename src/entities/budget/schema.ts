import { z } from 'zod';
import {
  DEFAULT_HORIZON_MONTHS,
  MAX_HORIZON_MONTHS,
  MIN_HORIZON_MONTHS
} from '@/shared/config/constants';

const moneyField = z.coerce.number().min(0, 'Debe ser mayor o igual a 0');

export const scenarioInputSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  initialCash: moneyField,
  monthlySalary: moneyField,
  offerAmount: moneyField,
  monthlyFixedExpenses: moneyField,
  monthlyVariableExpenses: moneyField,
  monthlyInvestmentContribution: moneyField,
  investmentAnnualReturnRate: z.coerce
    .number()
    .min(0, 'La tasa de retorno debe ser mayor o igual a 0')
    .max(1, 'La tasa de retorno debe ser menor o igual a 1'),
  otherMonthlyIncome: moneyField.default(0),
  otherMonthlyExpenses: moneyField.default(0),
  horizonMonths: z.coerce
    .number()
    .int('El horizonte debe ser un número entero')
    .min(MIN_HORIZON_MONTHS)
    .max(MAX_HORIZON_MONTHS)
    .default(DEFAULT_HORIZON_MONTHS)
});

export type ScenarioInputForm = z.infer<typeof scenarioInputSchema>;
