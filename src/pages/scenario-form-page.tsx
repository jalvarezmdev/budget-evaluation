import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ScenarioInputForm } from '@/entities/budget/schema';
import {
  useCreateScenarioMutation,
  useScenarioQuery,
  useUpdateScenarioMutation
} from '@/features/scenarios/api/scenario-queries';
import { useSettingsQuery } from '@/features/settings/api/settings-queries';
import {
  ScenarioForm,
  defaultScenarioFormValues
} from '@/features/scenarios/ui/scenario-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ScenarioFormPageProps = {
  mode: 'create' | 'edit';
};

export function ScenarioFormPage({ mode }: ScenarioFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const createMutation = useCreateScenarioMutation();
  const updateMutation = useUpdateScenarioMutation();
  const scenarioQuery = useScenarioQuery(mode === 'edit' ? id : undefined);
  const settingsQuery = useSettingsQuery(mode === 'create');

  const initialValues = useMemo<ScenarioInputForm | undefined>(() => {
    if (mode === 'create') {
      const settings = settingsQuery.data;

      return {
        ...defaultScenarioFormValues,
        monthlySalary: settings?.monthlySalary ?? defaultScenarioFormValues.monthlySalary,
        monthlyFixedExpenses:
          settings?.monthlyFixedExpenses ?? defaultScenarioFormValues.monthlyFixedExpenses,
        monthlyVariableExpenses:
          settings?.monthlyVariableExpenses ?? defaultScenarioFormValues.monthlyVariableExpenses,
        otherMonthlyIncome:
          settings?.otherMonthlyIncome ?? defaultScenarioFormValues.otherMonthlyIncome,
        otherMonthlyExpenses:
          settings?.otherMonthlyExpenses ?? defaultScenarioFormValues.otherMonthlyExpenses
      };
    }

    if (!scenarioQuery.data) {
      return undefined;
    }

    const scenario = scenarioQuery.data;
    return {
      name: scenario.name,
      initialCash: scenario.initialCash,
      monthlySalary: scenario.monthlySalary,
      offerAmount: scenario.offerAmount,
      monthlyFixedExpenses: scenario.monthlyFixedExpenses,
      monthlyVariableExpenses: scenario.monthlyVariableExpenses,
      monthlyInvestmentContribution: scenario.monthlyInvestmentContribution,
      investmentAnnualReturnRate: scenario.investmentAnnualReturnRate,
      otherMonthlyIncome: scenario.otherMonthlyIncome ?? 0,
      otherMonthlyExpenses: scenario.otherMonthlyExpenses ?? 0,
      horizonMonths: scenario.horizonMonths ?? 12
    };
  }, [mode, scenarioQuery.data, settingsQuery.data]);

  async function handleSubmit(values: ScenarioInputForm) {
    if (mode === 'create') {
      await createMutation.mutateAsync(values);
    } else if (id) {
      await updateMutation.mutateAsync({ id, input: values });
    }

    navigate('/');
  }

  if (mode === 'edit' && scenarioQuery.isLoading) {
    return (
      <Alert>
        <AlertTitle>Cargando escenario</AlertTitle>
        <AlertDescription>Obteniendo datos desde el almacenamiento local.</AlertDescription>
      </Alert>
    );
  }

  if (mode === 'create' && settingsQuery.isLoading) {
    return (
      <Alert>
        <AlertTitle>Cargando configuración base</AlertTitle>
        <AlertDescription>Estamos aplicando tus datos guardados para esta evaluación.</AlertDescription>
      </Alert>
    );
  }

  if (mode === 'edit' && !scenarioQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Escenario no encontrado</AlertTitle>
        <AlertDescription>El escenario seleccionado no existe.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-secondary/45 p-4">
        <h2 className="text-xl font-semibold">{mode === 'create' ? 'Crear escenario' : 'Editar escenario'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'create'
            ? 'Usamos tu configuración base para iniciar más rápido esta evaluación vehicular.'
            : 'Ajusta este escenario para comparar cómo cambia tu capacidad financiera.'}
        </p>
      </div>
      <ScenarioForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Crear escenario' : 'Actualizar escenario'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
