import {
  DEFAULT_HORIZON_MONTHS,
  MIN_HORIZON_MONTHS,
  MAX_HORIZON_MONTHS
} from '@/shared/config/constants';
import type {
  ProjectionPoint,
  RankedScenario,
  Scenario,
  ScenarioEvaluation,
  ScenarioInput
} from '@/entities/budget/types';

function resolveHorizonMonths(input: ScenarioInput): number {
  const horizon = input.horizonMonths ?? DEFAULT_HORIZON_MONTHS;

  if (horizon < MIN_HORIZON_MONTHS) {
    return MIN_HORIZON_MONTHS;
  }

  if (horizon > MAX_HORIZON_MONTHS) {
    return MAX_HORIZON_MONTHS;
  }

  return horizon;
}

export function projectScenario(input: ScenarioInput): ProjectionPoint[] {
  const horizonMonths = resolveHorizonMonths(input);
  const otherMonthlyIncome = input.otherMonthlyIncome ?? 0;
  const otherMonthlyExpenses = input.otherMonthlyExpenses ?? 0;
  const monthlyIncome = input.monthlySalary + otherMonthlyIncome;
  const monthlyExpenses =
    input.monthlyFixedExpenses + input.monthlyVariableExpenses + otherMonthlyExpenses;
  const monthlyNetCashflow =
    monthlyIncome - monthlyExpenses - input.monthlyInvestmentContribution;
  const monthlyReturnRate = input.investmentAnnualReturnRate / 12;

  let cashBalance = input.initialCash + input.offerAmount;
  let investmentBalance = 0;
  const projection: ProjectionPoint[] = [];

  for (let month = 1; month <= horizonMonths; month += 1) {
    cashBalance += monthlyNetCashflow;
    investmentBalance = investmentBalance * (1 + monthlyReturnRate) + input.monthlyInvestmentContribution;

    projection.push({
      month,
      cashBalance,
      investmentBalance,
      netWorth: cashBalance + investmentBalance
    });
  }

  return projection;
}

export function evaluateScenario(input: ScenarioInput, scenarioId = ''): ScenarioEvaluation {
  const projection = projectScenario(input);
  const lastPoint = projection.at(-1);
  const otherMonthlyIncome = input.otherMonthlyIncome ?? 0;
  const otherMonthlyExpenses = input.otherMonthlyExpenses ?? 0;
  const monthlyIncome = input.monthlySalary + otherMonthlyIncome;
  const monthlyExpenses =
    input.monthlyFixedExpenses + input.monthlyVariableExpenses + otherMonthlyExpenses;
  const monthlyNetCashflow =
    monthlyIncome - monthlyExpenses - input.monthlyInvestmentContribution;

  return {
    scenarioId,
    endingCash: lastPoint?.cashBalance ?? input.initialCash + input.offerAmount,
    endingInvestment: lastPoint?.investmentBalance ?? 0,
    endingNetWorth: lastPoint?.netWorth ?? input.initialCash + input.offerAmount,
    avgMonthlyCashflow: monthlyNetCashflow,
    savingsRate: monthlyIncome > 0 ? monthlyNetCashflow / monthlyIncome : null
  };
}

export function rankScenarios(items: Scenario[]): RankedScenario[] {
  return items
    .map((item) => {
      const evaluation = evaluateScenario(item, item.id);
      const otherMonthlyIncome = item.otherMonthlyIncome ?? 0;
      const otherMonthlyExpenses = item.otherMonthlyExpenses ?? 0;
      const monthlyIncome = item.monthlySalary + otherMonthlyIncome;
      const monthlyExpenses =
        item.monthlyFixedExpenses + item.monthlyVariableExpenses + otherMonthlyExpenses;
      const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : Number.POSITIVE_INFINITY;

      return {
        ...evaluation,
        scenarioName: item.name,
        _expenseRatio: expenseRatio
      };
    })
    .sort((a, b) => {
      if (b.endingNetWorth !== a.endingNetWorth) {
        return b.endingNetWorth - a.endingNetWorth;
      }

      if (b.avgMonthlyCashflow !== a.avgMonthlyCashflow) {
        return b.avgMonthlyCashflow - a.avgMonthlyCashflow;
      }

      return a._expenseRatio - b._expenseRatio;
    })
    .map((item, index) => ({
      scenarioId: item.scenarioId,
      endingCash: item.endingCash,
      endingInvestment: item.endingInvestment,
      endingNetWorth: item.endingNetWorth,
      avgMonthlyCashflow: item.avgMonthlyCashflow,
      savingsRate: item.savingsRate,
      scenarioName: item.scenarioName,
      rank: index + 1
    }));
}

