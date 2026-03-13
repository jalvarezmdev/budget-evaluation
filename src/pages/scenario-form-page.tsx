import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ScenarioInputForm } from '@/entities/budget/schema';
import { isVehicleScenario } from '@/entities/budget/types';
import {
  useCreateScenarioMutation,
  useScenarioQuery,
  useUpdateScenarioMutation
} from '@/features/scenarios/api/scenario-queries';
import { useSettingsQuery } from '@/features/settings/api/settings-queries';
import { defaultBudgetSettings } from '@/features/settings/model/settings-schema';
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
  const settingsQuery = useSettingsQuery();
  const settingsSnapshot = settingsQuery.data ?? defaultBudgetSettings;

  const initialValues = useMemo<ScenarioInputForm | undefined>(() => {
    if (mode === 'create') {
      return defaultScenarioFormValues;
    }

    if (!scenarioQuery.data) {
      return undefined;
    }

    const scenario = scenarioQuery.data;

    if (!isVehicleScenario(scenario)) {
      return {
        ...defaultScenarioFormValues,
        name: scenario.name,
        initialCash: scenario.initialCash
      };
    }

    return {
      name: scenario.name,
      initialCash: scenario.initialCash,
      vehiclePrice: scenario.vehicleFinancing.vehiclePrice,
      financingPlanPercent: scenario.vehicleFinancing.financingPlanPercent,
      downPaymentPercent: scenario.vehicleFinancing.downPaymentPercent,
      monthlyInstallment: scenario.vehicleFinancing.monthlyInstallment,
      financingPeriodMonths: scenario.vehicleFinancing.financingPeriodMonths,
      specialInstallments: scenario.vehicleFinancing.specialInstallments,
      vehicleImageDataUrl: scenario.vehicleImageDataUrl ?? ''
    };
  }, [mode, scenarioQuery.data]);

  async function handleSubmit(values: ScenarioInputForm) {
    const input = {
      name: values.name,
      initialCash: values.initialCash,
      vehicleFinancing: {
        vehiclePrice: values.vehiclePrice,
        financingPlanPercent: values.financingPlanPercent,
        downPaymentPercent: values.downPaymentPercent,
        monthlyInstallment: values.monthlyInstallment,
        financingPeriodMonths: values.financingPeriodMonths,
        specialInstallments: values.specialInstallments.map((installment, index) => ({
          id: installment.id ?? `special-${index}`,
          month: installment.month,
          amount: installment.amount
        }))
      },
      financialProfileSnapshot: settingsSnapshot,
      vehicleImageDataUrl: values.vehicleImageDataUrl
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(input);
    } else if (id) {
      await updateMutation.mutateAsync({ id, input });
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

  if (settingsQuery.isLoading) {
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
        financialProfile={settingsSnapshot}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Crear escenario' : 'Actualizar escenario'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {mode === 'edit' && scenarioQuery.data && !isVehicleScenario(scenarioQuery.data) ? (
        <Alert>
          <AlertTitle>Escenario legado detectado</AlertTitle>
          <AlertDescription>
            Este escenario usa el modelo anterior. Completa los nuevos campos vehiculares para convertirlo.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
