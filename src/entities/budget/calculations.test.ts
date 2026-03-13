import { describe, expect, it } from 'vitest';
import { evaluateScenario, projectScenario, rankScenarios } from '@/entities/budget/calculations';
import type { Scenario, ScenarioInput } from '@/entities/budget/types';

const baseInput: ScenarioInput = {
  name: 'Base',
  initialCash: 1000,
  monthlySalary: 3000,
  offerAmount: 500,
  monthlyFixedExpenses: 1000,
  monthlyVariableExpenses: 500,
  monthlyInvestmentContribution: 500,
  investmentAnnualReturnRate: 0,
  otherMonthlyIncome: 0,
  otherMonthlyExpenses: 0,
  horizonMonths: 12
};

describe('budget calculations', () => {
  it('projects base scenario with positive values', () => {
    const projection = projectScenario(baseInput);
    const last = projection.at(-1);

    expect(projection).toHaveLength(12);
    expect(last?.cashBalance).toBe(13500);
    expect(last?.investmentBalance).toBe(6000);
    expect(last?.netWorth).toBe(19500);
  });

  it('applies offer only as initial one-time amount', () => {
    const withOffer = evaluateScenario(baseInput);
    const withoutOffer = evaluateScenario({ ...baseInput, offerAmount: 0 });

    expect(withOffer.endingNetWorth - withoutOffer.endingNetWorth).toBe(500);
  });

  it('grows investment balance when return rate exists', () => {
    const withReturn = evaluateScenario({
      ...baseInput,
      investmentAnnualReturnRate: 0.12
    });
    const withoutReturn = evaluateScenario({
      ...baseInput,
      investmentAnnualReturnRate: 0
    });

    expect(withReturn.endingInvestment).toBeGreaterThan(withoutReturn.endingInvestment);
  });

  it('handles scenario with zero return correctly', () => {
    const evaluation = evaluateScenario({ ...baseInput, investmentAnnualReturnRate: 0 });

    expect(evaluation.endingInvestment).toBe(6000);
  });

  it('ranks scenarios by net worth then cashflow then expense ratio', () => {
    const scenarios: Scenario[] = [
      {
        id: 'a',
        createdAt: '2026-03-13T00:00:00.000Z',
        updatedAt: '2026-03-13T00:00:00.000Z',
        name: 'A',
        initialCash: 0,
        monthlySalary: 100,
        offerAmount: 0,
        monthlyFixedExpenses: 0,
        monthlyVariableExpenses: 0,
        monthlyInvestmentContribution: 0,
        investmentAnnualReturnRate: 0,
        otherMonthlyIncome: 0,
        otherMonthlyExpenses: 0,
        horizonMonths: 1
      },
      {
        id: 'e',
        createdAt: '2026-03-13T00:00:00.000Z',
        updatedAt: '2026-03-13T00:00:00.000Z',
        name: 'E',
        initialCash: 0,
        monthlySalary: 500,
        offerAmount: 0,
        monthlyFixedExpenses: 400,
        monthlyVariableExpenses: 0,
        monthlyInvestmentContribution: 0,
        investmentAnnualReturnRate: 0,
        otherMonthlyIncome: 0,
        otherMonthlyExpenses: 0,
        horizonMonths: 1
      },
      {
        id: 'd',
        createdAt: '2026-03-13T00:00:00.000Z',
        updatedAt: '2026-03-13T00:00:00.000Z',
        name: 'D',
        initialCash: 0,
        monthlySalary: 1000,
        offerAmount: 0,
        monthlyFixedExpenses: 900,
        monthlyVariableExpenses: 0,
        monthlyInvestmentContribution: 0,
        investmentAnnualReturnRate: 0,
        otherMonthlyIncome: 0,
        otherMonthlyExpenses: 0,
        horizonMonths: 1
      },
      {
        id: 'b',
        createdAt: '2026-03-13T00:00:00.000Z',
        updatedAt: '2026-03-13T00:00:00.000Z',
        name: 'B',
        initialCash: 100,
        monthlySalary: 0,
        offerAmount: 0,
        monthlyFixedExpenses: 0,
        monthlyVariableExpenses: 0,
        monthlyInvestmentContribution: 0,
        investmentAnnualReturnRate: 0,
        otherMonthlyIncome: 0,
        otherMonthlyExpenses: 0,
        horizonMonths: 1
      }
    ];

    const ranked = rankScenarios(scenarios);

    expect(ranked.map((item) => item.scenarioId)).toEqual(['a', 'e', 'd', 'b']);
    expect(ranked[0]?.rank).toBe(1);
  });

  it('supports negative cashflow and savings rate', () => {
    const evaluation = evaluateScenario({
      ...baseInput,
      monthlySalary: 1000,
      monthlyFixedExpenses: 800,
      monthlyVariableExpenses: 400,
      monthlyInvestmentContribution: 0,
      offerAmount: 0,
      initialCash: 0
    });

    expect(evaluation.avgMonthlyCashflow).toBe(-200);
    expect(evaluation.savingsRate).toBe(-0.2);
  });
});

