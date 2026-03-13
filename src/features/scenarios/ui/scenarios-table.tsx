import { Link } from 'react-router-dom';
import type { RankedScenario, Scenario } from '@/entities/budget/types';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDate } from '@/shared/lib/date';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type ScenariosTableProps = {
  scenarios: Scenario[];
  ranking: RankedScenario[];
  onDelete: (scenarioId: string) => void;
  deletingId?: string;
};

export function ScenariosTable({ scenarios, ranking, onDelete, deletingId }: ScenariosTableProps) {
  const rankingById = new Map(ranking.map((item) => [item.scenarioId, item]));

  return (
    <Table>
      <TableCaption>Tu lista de escenarios se guarda localmente en este navegador.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Actualizado</TableHead>
          <TableHead>Patrimonio neto final</TableHead>
          <TableHead>Puesto</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scenarios.map((scenario) => {
          const evaluation = rankingById.get(scenario.id);

          return (
            <TableRow key={scenario.id} className={evaluation?.rank === 1 ? 'bg-tertiary/10' : undefined}>
              <TableCell className="font-medium">{scenario.name}</TableCell>
              <TableCell>{formatDate(scenario.updatedAt)}</TableCell>
              <TableCell>{formatCurrency(evaluation?.endingNetWorth ?? 0)}</TableCell>
              <TableCell>
                {evaluation?.rank ? <Badge variant={evaluation.rank === 1 ? 'success' : 'secondary'}>#{evaluation.rank}</Badge> : '-'}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Link
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    to={`/scenarios/${scenario.id}/edit`}
                  >
                    Editar
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(scenario.id)}
                    disabled={deletingId === scenario.id}
                  >
                    {deletingId === scenario.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
