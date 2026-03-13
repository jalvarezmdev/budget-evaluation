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
          <TableHead>Patrimonio neto final</TableHead>
          <TableHead>Efectivo final</TableHead>
          <TableHead>Inversión final</TableHead>
          <TableHead>Flujo mensual promedio</TableHead>
          <TableHead>Tasa de ahorro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ranking.map((item) => (
          <TableRow key={item.scenarioId} className={item.rank === 1 ? 'bg-tertiary/10' : undefined}>
            <TableCell>
              <Badge variant={rankBadgeVariant(item.rank)}>#{item.rank}</Badge>
            </TableCell>
            <TableCell className="font-medium">{item.scenarioName}</TableCell>
            <TableCell>{formatCurrency(item.endingNetWorth)}</TableCell>
            <TableCell>{formatCurrency(item.endingCash)}</TableCell>
            <TableCell>{formatCurrency(item.endingInvestment)}</TableCell>
            <TableCell>{formatCurrency(item.avgMonthlyCashflow)}</TableCell>
            <TableCell>{formatPercent(item.savingsRate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
