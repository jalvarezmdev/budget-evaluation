import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { scenarioInputSchema, type ScenarioInputForm } from '@/entities/budget/schema';
import { evaluateScenario } from '@/entities/budget/calculations';
import { DEFAULT_HORIZON_MONTHS } from '@/shared/config/constants';
import { formatCurrency, formatPercent } from '@/shared/lib/currency';
import { toNumber } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const defaultScenarioFormValues: ScenarioInputForm = {
  name: '',
  initialCash: 0,
  monthlySalary: 0,
  offerAmount: 0,
  monthlyFixedExpenses: 0,
  monthlyVariableExpenses: 0,
  monthlyInvestmentContribution: 0,
  investmentAnnualReturnRate: 0.08,
  otherMonthlyIncome: 0,
  otherMonthlyExpenses: 0,
  horizonMonths: DEFAULT_HORIZON_MONTHS
};

type ScenarioFormProps = {
  initialValues?: ScenarioInputForm;
  onSubmit: (values: ScenarioInputForm) => Promise<void> | void;
  submitLabel: string;
  isSubmitting?: boolean;
};

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null;
  }

  return String(error.message);
}

type NumberFieldProps = {
  id: Exclude<keyof ScenarioInputForm, 'name'>;
  label: string;
  step?: string;
  form: ReturnType<typeof useForm<ScenarioInputForm>>;
};

function NumberField({ id, label, step = '0.01', form }: NumberFieldProps) {
  const errorMessage = getErrorMessage(form.formState.errors[id]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step={step} {...form.register(id, { valueAsNumber: true })} />
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

export function ScenarioForm({ initialValues, onSubmit, submitLabel, isSubmitting = false }: ScenarioFormProps) {
  const form = useForm<ScenarioInputForm>({
    resolver: zodResolver(scenarioInputSchema),
    defaultValues: initialValues ?? defaultScenarioFormValues
  });

  const values = form.watch();
  const liveEvaluation = useMemo(() => {
    if (!values.name) {
      return null;
    }

    return evaluateScenario({
      ...values,
      name: values.name,
      initialCash: toNumber(values.initialCash),
      monthlySalary: toNumber(values.monthlySalary),
      offerAmount: toNumber(values.offerAmount),
      monthlyFixedExpenses: toNumber(values.monthlyFixedExpenses),
      monthlyVariableExpenses: toNumber(values.monthlyVariableExpenses),
      monthlyInvestmentContribution: toNumber(values.monthlyInvestmentContribution),
      investmentAnnualReturnRate: toNumber(values.investmentAnnualReturnRate),
      otherMonthlyIncome: toNumber(values.otherMonthlyIncome),
      otherMonthlyExpenses: toNumber(values.otherMonthlyExpenses),
      horizonMonths: toNumber(values.horizonMonths)
    });
  }, [values]);

  const nameError = getErrorMessage(form.formState.errors.name);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>Formulario de escenario</CardTitle>
          <CardDescription>
            Define tus supuestos financieros para evaluar y comparar ofertas de vehículos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del escenario</Label>
              <Input id="name" placeholder="Ejemplo: SUV 2026 - Escenario conservador" {...form.register('name')} />
              {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
            </div>

            <p className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-primary">Base financiera</p>

            <NumberField form={form} id="initialCash" label="Dinero inicial" />
            <NumberField form={form} id="offerAmount" label="Oferta del vehículo (única, mes 0)" />
            <NumberField form={form} id="monthlySalary" label="Salario mensual" />
            <NumberField form={form} id="otherMonthlyIncome" label="Otros ingresos mensuales" />

            <p className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-primary">Gastos y estrategia</p>

            <NumberField form={form} id="monthlyFixedExpenses" label="Gastos fijos mensuales" />
            <NumberField form={form} id="monthlyVariableExpenses" label="Gastos variables mensuales" />
            <NumberField form={form} id="otherMonthlyExpenses" label="Otros gastos mensuales" />
            <NumberField form={form} id="monthlyInvestmentContribution" label="Inversión mensual" />
            <NumberField form={form} id="investmentAnnualReturnRate" label="Retorno anual de inversión (0-1)" step="0.001" />
            <NumberField form={form} id="horizonMonths" label="Meses de horizonte (1-24)" step="1" />

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen en vivo</CardTitle>
          <CardDescription>Proyección rápida para validar si la oferta encaja con tu bolsillo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="rounded-md border border-white/10 bg-background/40 px-3 py-2">
            Patrimonio neto final:{' '}
            <strong>{formatCurrency(liveEvaluation?.endingNetWorth ?? 0)}</strong>
          </p>
          <p className="rounded-md border border-white/10 bg-background/40 px-3 py-2">
            Efectivo final: <strong>{formatCurrency(liveEvaluation?.endingCash ?? 0)}</strong>
          </p>
          <p className="rounded-md border border-white/10 bg-background/40 px-3 py-2">
            Inversión final: <strong>{formatCurrency(liveEvaluation?.endingInvestment ?? 0)}</strong>
          </p>
          <p className="rounded-md border border-white/10 bg-background/40 px-3 py-2">
            Tasa de ahorro: <strong>{formatPercent(liveEvaluation?.savingsRate ?? null)}</strong>
          </p>

          <div className="mt-4 rounded-lg border border-primary/25 bg-primary/10 p-3 text-xs text-primary">
            Si tu flujo mensual promedio es bajo, prioriza menor oferta inicial o menor gasto variable estimado.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
