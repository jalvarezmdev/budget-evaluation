export type ScenarioInput = {
  name: string;
  initialCash: number;
  monthlySalary: number;
  offerAmount: number;
  monthlyFixedExpenses: number;
  monthlyVariableExpenses: number;
  monthlyInvestmentContribution: number;
  investmentAnnualReturnRate: number;
  otherMonthlyIncome?: number;
  otherMonthlyExpenses?: number;
  horizonMonths?: number;
};

export type Scenario = ScenarioInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectionPoint = {
  month: number;
  cashBalance: number;
  investmentBalance: number;
  netWorth: number;
};

export type ScenarioEvaluation = {
  scenarioId: string;
  endingCash: number;
  endingInvestment: number;
  endingNetWorth: number;
  avgMonthlyCashflow: number;
  savingsRate: number | null;
};

export type RankedScenario = ScenarioEvaluation & {
  rank: number;
  scenarioName: string;
};

export type ScenarioStoragePayload = {
  version: number;
  scenarios: Scenario[];
};

export type BudgetSettings = {
  monthlySalary: number;
  monthlyFixedExpenses: number;
  otherMonthlyExpenses: number;
  otherMonthlyIncome: number;
  monthlyVariableExpenses: number;
};
