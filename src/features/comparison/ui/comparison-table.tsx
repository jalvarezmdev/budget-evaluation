import type { RankedScenario } from '@/entities/budget/types';
import { formatCurrency, formatPercent } from '@/shared/lib/currency';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type ComparisonTableProps = {
  ranking: RankedScenario[];
};

function rankBadgeVariant(rank: number): 'success' | 'secondary' | 'outline' {
  if (rank === 1) {
    return 'success';
  }

  if (rank <= 3) {
    return 'secondary';
  }

  return 'outline';
}

export function ComparisonTable({ ranking }: ComparisonTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Puesto</TableHead>
          <TableHead>Escenario</TableHead>
          <TableHead>Flujo libre mensual</TableHead>
          <TableHead>Meses en negativo</TableHead>
          <TableHead>Caja mínima</TableHead>
          <TableHead>Caja final</TableHead>
          <TableHead>Costo total vehículo</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ranking.map((item) => (
          <TableRow key={item.scenarioId} className={item.rank === 1 ? 'bg-tertiary/10' : undefined}>
            <TableCell>
              <Badge variant={rankBadgeVariant(item.rank)}>#{item.rank}</Badge>
            </TableCell>
            <TableCell className="font-medium">{item.scenarioName}</TableCell>
            <TableCell>{formatCurrency(item.avgMonthlyFreeCash)}</TableCell>
            <TableCell>{item.negativeMonths}</TableCell>
            <TableCell>{formatCurrency(item.minCashBalance)}</TableCell>
            <TableCell>{formatCurrency(item.endingCash)}</TableCell>
            <TableCell>{formatCurrency(item.totalVehicleCost)}</TableCell>
            <TableCell>{formatPercent(item.affordabilityScore / 100)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
