import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSettingsQuery,
  useUpdateSettingsMutation
} from '@/features/settings/api/settings-queries';
import {
  budgetSettingsSchema,
  defaultBudgetSettings,
  type BudgetSettingsForm
} from '@/features/settings/model/settings-schema';

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null;
  }

  return String(error.message);
}

type NumberFieldProps = {
  id: keyof BudgetSettingsForm;
  label: string;
  form: ReturnType<typeof useForm<BudgetSettingsForm>>;
};

function NumberField({ id, label, form }: NumberFieldProps) {
  const errorMessage = getErrorMessage(form.formState.errors[id]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step="0.01" {...form.register(id, { valueAsNumber: true })} />
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

export function SettingsPage() {
  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  const form = useForm<BudgetSettingsForm>({
    resolver: zodResolver(budgetSettingsSchema),
    defaultValues: defaultBudgetSettings
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(settingsQuery.data);
    }
  }, [form, settingsQuery.data]);

  async function handleSubmit(values: BudgetSettingsForm) {
    await updateSettingsMutation.mutateAsync(values);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-secondary/90 via-accent/60 to-secondary/90 p-6">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Guarda tus datos financieros base para evaluar ofertas de vehículos con mayor rapidez.
        </p>
      </section>

      {settingsQuery.isLoading ? (
        <Alert>
          <AlertTitle>Cargando configuración</AlertTitle>
          <AlertDescription>Estamos obteniendo tus valores guardados.</AlertDescription>
        </Alert>
      ) : null}

      {updateSettingsMutation.isSuccess ? (
        <Alert>
          <AlertTitle>Configuración actualizada</AlertTitle>
          <AlertDescription>Estos valores se usarán como base al crear nuevos escenarios.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Perfil financiero base</CardTitle>
          <CardDescription>
            Ajusta estos montos mensuales para arrancar cada evaluación con tus datos reales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)}>
            <NumberField form={form} id="monthlySalary" label="Salario mensual" />
            <NumberField form={form} id="monthlyFixedExpenses" label="Gastos fijos mensuales" />
            <NumberField form={form} id="monthlyVariableExpenses" label="Gastos variables mensuales" />
            <NumberField form={form} id="otherMonthlyExpenses" label="Otros gastos mensuales" />
            <NumberField form={form} id="otherMonthlyIncome" label="Otros ingresos mensuales" />

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-tertiary/30 bg-tertiary/10 p-4 text-sm text-tertiary">
            Recomendación: mantén el costo mensual estimado del vehículo por debajo del flujo mensual disponible de
            tus escenarios para reducir riesgo financiero.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
