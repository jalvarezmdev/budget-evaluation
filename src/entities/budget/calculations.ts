import type {
  ProjectionPoint,
  RankedScenario,
  Scenario,
  ScenarioEvaluation,
  ScenarioInput,
  VehicleScenario
} from '@/entities/budget/types';
import { isVehicleScenario } from '@/entities/budget/types';

function resolvePeriodMonths(period: number): number {
  if (period < 1) {
    return 1;
  }

  if (period > 120) {
    return 120;
  }

  return period;
}

export function projectScenario(input: ScenarioInput): ProjectionPoint[] {
  const periodMonths = resolvePeriodMonths(input.vehicleFinancing.financingPeriodMonths);
  const baseIncome =
    input.financialProfileSnapshot.monthlySalary + input.financialProfileSnapshot.otherMonthlyIncome;
  const baseExpenses =
    input.financialProfileSnapshot.monthlyFixedExpenses +
    input.financialProfileSnapshot.monthlyVariableExpenses +
    input.financialProfileSnapshot.otherMonthlyExpenses;
  const downPaymentAmount =
    input.vehicleFinancing.vehiclePrice * (input.vehicleFinancing.downPaymentPercent / 100);
  const initialSpecialInstallments = input.vehicleFinancing.specialInstallments
    .filter((installment) => installment.month === 1)
    .reduce((sum, installment) => sum + installment.amount, 0);

  let cashBalance = input.initialCash - downPaymentAmount - initialSpecialInstallments;
  const projection: ProjectionPoint[] = [];

  for (let month = 1; month <= periodMonths; month += 1) {
    const specialInstallmentAmount = input.vehicleFinancing.specialInstallments
      .filter((installment) => installment.month === month && installment.month !== 1)
      .reduce((sum, installment) => sum + installment.amount, 0);

    const vehiclePayment = input.vehicleFinancing.monthlyInstallment + specialInstallmentAmount;
    const monthlyFreeCash = baseIncome - baseExpenses - vehiclePayment;

    cashBalance += monthlyFreeCash;

    projection.push({
      month,
      cashBalance,
      monthlyFreeCash,
      vehiclePayment,
      specialInstallmentAmount
    });
  }

  return projection;
}

export function evaluateScenario(input: ScenarioInput, scenarioId = ''): ScenarioEvaluation {
  const projection = projectScenario(input);
  const periodMonths = resolvePeriodMonths(input.vehicleFinancing.financingPeriodMonths);
  const downPaymentAmount =
    input.vehicleFinancing.vehiclePrice * (input.vehicleFinancing.downPaymentPercent / 100);
  const initialSpecialInstallments = input.vehicleFinancing.specialInstallments
    .filter((installment) => installment.month === 1)
    .reduce((sum, installment) => sum + installment.amount, 0);
  const cashAfterInitialPayment =
    input.initialCash - downPaymentAmount - initialSpecialInstallments;

  const endingCash = projection.at(-1)?.cashBalance ?? cashAfterInitialPayment;
  const avgMonthlyFreeCash =
    projection.length > 0
      ? projection.reduce((sum, point) => sum + point.monthlyFreeCash, 0) / projection.length
      : 0;
  const minCashBalance = projection.reduce(
    (minimum, point) => Math.min(minimum, point.cashBalance),
    cashAfterInitialPayment
  );
  const negativeMonths = projection.filter((point) => point.cashBalance < 0).length;
  const totalSpecialInstallments = input.vehicleFinancing.specialInstallments.reduce(
    (sum, installment) => sum + installment.amount,
    0
  );
  const totalVehicleCost =
    downPaymentAmount +
    input.vehicleFinancing.monthlyInstallment * periodMonths +
    totalSpecialInstallments;

  const affordabilityScore = Math.max(
    0,
    Math.min(
      100,
      60 - negativeMonths * 15 + Math.max(-20, Math.min(20, avgMonthlyFreeCash / 100)) + Math.max(-20, Math.min(20, minCashBalance / 500))
    )
  );

  return {
    scenarioId,
    endingCash,
    avgMonthlyFreeCash,
    minCashBalance,
    negativeMonths,
    totalVehicleCost,
    affordabilityScore
  };
}

export function rankScenarios(items: Scenario[]): RankedScenario[] {
  return items
    .filter(isVehicleScenario)
    .map((item) => {
      const evaluation = evaluateScenario(item, item.id);

      return {
        ...evaluation,
        scenarioName: item.name
      };
    })
    .sort((a, b) => {
      if (a.negativeMonths !== b.negativeMonths) {
        return a.negativeMonths - b.negativeMonths;
      }

      if (b.minCashBalance !== a.minCashBalance) {
        return b.minCashBalance - a.minCashBalance;
      }

      if (b.avgMonthlyFreeCash !== a.avgMonthlyFreeCash) {
        return b.avgMonthlyFreeCash - a.avgMonthlyFreeCash;
      }

      return a.totalVehicleCost - b.totalVehicleCost;
    })
    .map((item, index) => ({
      scenarioId: item.scenarioId,
      endingCash: item.endingCash,
      avgMonthlyFreeCash: item.avgMonthlyFreeCash,
      minCashBalance: item.minCashBalance,
      negativeMonths: item.negativeMonths,
      totalVehicleCost: item.totalVehicleCost,
      affordabilityScore: item.affordabilityScore,
      scenarioName: item.scenarioName,
      rank: index + 1
    }));
}

export function evaluateVehicleScenario(scenario: VehicleScenario): ScenarioEvaluation {
  return evaluateScenario(
    {
      name: scenario.name,
      initialCash: scenario.initialCash,
      vehicleFinancing: scenario.vehicleFinancing,
      financialProfileSnapshot: scenario.financialProfileSnapshot
    },
    scenario.id
  );
}
