import { z } from 'zod';

const moneyField = z.coerce.number().min(0, 'Debe ser mayor o igual a 0');

const percentageField = z.coerce
  .number()
  .min(0, 'Debe ser mayor o igual a 0')
  .max(100, 'Debe ser menor o igual a 100');

const specialInstallmentSchema = z.object({
  id: z.string().optional(),
  month: z.coerce.number().int('Debe ser un número entero').min(1, 'El mes mínimo es 1'),
  amount: moneyField
});

const imageDataUrlField = z
  .string()
  .max(2_500_000, 'La imagen es demasiado grande')
  .refine((value) => value.length === 0 || value.startsWith('data:image/'), {
    message: 'La imagen debe ser un archivo válido'
  });

export const scenarioInputSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  initialCash: moneyField,
  vehiclePrice: moneyField,
  financingPlanPercent: percentageField,
  downPaymentPercent: percentageField,
  monthlyInstallment: moneyField,
  financingPeriodMonths: z.coerce
    .number()
    .int('El periodo debe ser un número entero')
    .min(1, 'El periodo mínimo es 1 mes')
    .max(120, 'El periodo máximo es 120 meses'),
  specialInstallments: z.array(specialInstallmentSchema).default([]),
  vehicleImageDataUrl: imageDataUrlField.optional().default('')
}).superRefine((values, context) => {
  if (values.downPaymentPercent + values.financingPlanPercent > 100) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La suma de % inicial y % financiamiento no puede exceder 100',
      path: ['financingPlanPercent']
    });
  }

  values.specialInstallments.forEach((installment, index) => {
    if (installment.month > values.financingPeriodMonths) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El mes de cuota especial debe estar dentro del periodo de financiamiento',
        path: ['specialInstallments', index, 'month']
      });
    }
  });
});

export type ScenarioInputForm = z.infer<typeof scenarioInputSchema>;
