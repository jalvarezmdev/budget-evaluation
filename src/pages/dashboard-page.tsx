import { Link } from 'react-router-dom';
import { Car, CircleDollarSign, Gauge, TrendingUp } from 'lucide-react';
import { rankScenarios } from '@/entities/budget/calculations';
import { useDeleteScenarioMutation, useScenariosQuery } from '@/features/scenarios/api/scenario-queries';
import { ScenariosTable } from '@/features/scenarios/ui/scenarios-table';
import { formatCurrency } from '@/shared/lib/currency';
import { cn } from '@/shared/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  const scenariosQuery = useScenariosQuery();
  const deleteMutation = useDeleteScenarioMutation();
  const scenarios = scenariosQuery.data ?? [];
  const ranking = rankScenarios(scenarios);
  const bestScenario = ranking[0];

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-secondary/90 via-accent/70 to-secondary/90 p-6 shadow-soft">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/40 bg-tertiary/15 px-3 py-1 text-xs font-medium text-tertiary">
              <Car className="h-3.5 w-3.5" />
              Evaluación de ofertas vehiculares
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Escenarios de presupuesto</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Simula ofertas y cuotas para decidir qué vehículo encaja mejor con tu bolsillo.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 md:w-auto">
            <Link className={cn(buttonVariants({ variant: 'outline' }))} to="/compare">
              Comparar escenarios
            </Link>
            <Link className={cn(buttonVariants({ variant: 'default' }))} to="/scenarios/new">
              Nuevo análisis
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total de escenarios</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold">{scenarios.length}</p>
            <span className="rounded-full bg-primary/20 p-2 text-primary">
              <Gauge className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="metric-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Mejor caja final</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-semibold">{formatCurrency(bestScenario?.endingCash ?? 0)}</p>
            <span className="rounded-full bg-primary/20 p-2 text-primary">
              <CircleDollarSign className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="metric-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Escenario recomendado</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xl font-semibold">{bestScenario?.scenarioName ?? 'N/D'}</p>
            <span className="rounded-full bg-tertiary/20 p-2 text-tertiary">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escenarios guardados</CardTitle>
          <CardDescription>
            Revisa tus comparaciones y elimina las opciones que no cumplan con tu capacidad mensual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scenariosQuery.isLoading && scenarios.length > 0 ? (
            <ScenariosTable
              scenarios={scenarios}
              ranking={ranking}
              onDelete={handleDelete}
              deletingId={deleteMutation.variables}
            />
          ) : null}
        </CardContent>
      </Card>

      {scenariosQuery.isLoading ? (
        <Alert>
          <AlertTitle>Cargando escenarios</AlertTitle>
          <AlertDescription>Espera mientras cargamos tus datos locales.</AlertDescription>
        </Alert>
      ) : null}

      {!scenariosQuery.isLoading && scenarios.length === 0 ? (
        <Alert>
          <AlertTitle>Aún no hay escenarios</AlertTitle>
          <AlertDescription>
            Crea tu primer escenario para comenzar a evaluar ofertas de vehículos según tu flujo mensual.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
