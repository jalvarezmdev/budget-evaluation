import { Badge } from '@/components/ui/badge';
import { rankScenarios } from '@/entities/budget/calculations';
import { useScenariosQuery } from '@/features/scenarios/api/scenario-queries';
import { ComparisonTable } from '@/features/comparison/ui/comparison-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/shared/lib/currency';

export function ComparePage() {
  const scenariosQuery = useScenariosQuery();
  const scenarios = scenariosQuery.data ?? [];
  const ranking = rankScenarios(scenarios);
  const best = ranking[0];

  if (scenariosQuery.isLoading) {
    return (
      <Alert>
        <AlertTitle>Cargando comparación</AlertTitle>
        <AlertDescription>Preparando tu tabla de clasificación.</AlertDescription>
      </Alert>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Alert>
        <AlertTitle>No hay escenarios disponibles</AlertTitle>
        <AlertDescription>Crea escenarios primero y vuelve para compararlos.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {best ? (
        <Card className="border-primary/25 bg-gradient-to-r from-secondary/90 via-accent/60 to-secondary/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Mejor opción en este momento
              <Badge variant="success">#{best.rank}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Escenario</p>
              <p className="text-lg font-semibold">{best.scenarioName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Patrimonio final</p>
              <p className="text-lg font-semibold">{formatCurrency(best.endingNetWorth)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasa de ahorro</p>
              <p className="text-lg font-semibold">{formatPercent(best.savingsRate)}</p>
            </div>
            <p className="md:col-span-3 text-sm text-muted-foreground">
              Esta recomendación prioriza el mayor patrimonio neto final para ayudarte a elegir la oferta de
              vehículo más saludable para tus finanzas.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Ranking detallado de escenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonTable ranking={ranking} />
        </CardContent>
      </Card>
    </div>
  );
}
