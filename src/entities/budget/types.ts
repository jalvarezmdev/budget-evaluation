export type BudgetSettings = {
  monthlySalary: number;
  monthlyFixedExpenses: number;
  otherMonthlyExpenses: number;
  otherMonthlyIncome: number;
  monthlyVariableExpenses: number;
};

export type ScenarioModelVersion = 'legacy-v1' | 'vehicle-v2';

export type SpecialInstallment = {
  id: string;
  month: number;
  amount: number;
};

export type VehicleFinancing = {
  vehiclePrice: number;
  financingPlanPercent: number;
  downPaymentPercent: number;
  monthlyInstallment: number;
  financingPeriodMonths: number;
  specialInstallments: SpecialInstallment[];
};

export type ScenarioInput = {
  name: string;
  initialCash: number;
  vehicleFinancing: VehicleFinancing;
  financialProfileSnapshot: BudgetSettings;
  vehicleImageDataUrl?: string;
};

export type LegacyScenarioData = {
  monthlySalary?: number;
  offerAmount?: number;
  monthlyFixedExpenses?: number;
  monthlyVariableExpenses?: number;
  monthlyInvestmentContribution?: number;
  investmentAnnualReturnRate?: number;
  otherMonthlyIncome?: number;
  otherMonthlyExpenses?: number;
  horizonMonths?: number;
};

export type VehicleScenario = ScenarioInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  modelVersion: 'vehicle-v2';
};

export type LegacyScenario = {
  id: string;
  createdAt: string;
  updatedAt: string;
  modelVersion: 'legacy-v1';
  name: string;
  initialCash: number;
  legacyData?: LegacyScenarioData;
};

export type Scenario = VehicleScenario | LegacyScenario;

export type ProjectionPoint = {
  month: number;
  cashBalance: number;
  monthlyFreeCash: number;
  vehiclePayment: number;
  specialInstallmentAmount: number;
};

export type ScenarioEvaluation = {
  scenarioId: string;
  endingCash: number;
  avgMonthlyFreeCash: number;
  minCashBalance: number;
  negativeMonths: number;
  totalVehicleCost: number;
  affordabilityScore: number;
};

export type RankedScenario = ScenarioEvaluation & {
  rank: number;
  scenarioName: string;
};

export type ScenarioStoragePayload = {
  version: number;
  scenarios: Scenario[];
};

export function isVehicleScenario(scenario: Scenario): scenario is VehicleScenario {
  return scenario.modelVersion === 'vehicle-v2';
}
