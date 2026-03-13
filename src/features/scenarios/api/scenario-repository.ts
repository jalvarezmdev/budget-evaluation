import {
  STORAGE_KEYS,
  STORAGE_VERSION
} from '@/shared/config/constants';
import { generateId } from '@/shared/lib/id';
import { readStorage, writeStorage } from '@/shared/lib/storage';
import type {
  BudgetSettings,
  LegacyScenario,
  Scenario,
  ScenarioInput,
  ScenarioStoragePayload,
  SpecialInstallment,
  VehicleFinancing,
  VehicleScenario
} from '@/entities/budget/types';
import { defaultBudgetSettings } from '@/features/settings/model/settings-schema';

type RawScenario = Record<string, unknown>;

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (isFiniteNonNegativeNumber(value)) {
    return value;
  }

  return fallback;
}

function normalizeBudgetSettings(payload: unknown): BudgetSettings {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};

  return {
    monthlySalary: normalizeNumber(source.monthlySalary, defaultBudgetSettings.monthlySalary),
    monthlyFixedExpenses: normalizeNumber(
      source.monthlyFixedExpenses,
      defaultBudgetSettings.monthlyFixedExpenses
    ),
    monthlyVariableExpenses: normalizeNumber(
      source.monthlyVariableExpenses,
      defaultBudgetSettings.monthlyVariableExpenses
    ),
    otherMonthlyIncome: normalizeNumber(
      source.otherMonthlyIncome,
      defaultBudgetSettings.otherMonthlyIncome
    ),
    otherMonthlyExpenses: normalizeNumber(
      source.otherMonthlyExpenses,
      defaultBudgetSettings.otherMonthlyExpenses
    )
  };
}

function normalizeSpecialInstallments(
  payload: unknown,
  financingPeriodMonths: number
): SpecialInstallment[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item, index) => {
      const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const month = Math.max(1, Math.min(financingPeriodMonths, Math.floor(normalizeNumber(source.month, 1))));

      return {
        id: typeof source.id === 'string' && source.id.length > 0 ? source.id : `legacy-special-${index}`,
        month,
        amount: normalizeNumber(source.amount, 0)
      };
    })
    .filter((item) => item.amount > 0);
}

function normalizeVehicleFinancing(payload: unknown): VehicleFinancing {
  const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const financingPeriodMonths = Math.max(
    1,
    Math.min(120, Math.floor(normalizeNumber(source.financingPeriodMonths, 12)))
  );

  return {
    vehiclePrice: normalizeNumber(source.vehiclePrice, 0),
    financingPlanPercent: Math.max(0, Math.min(100, normalizeNumber(source.financingPlanPercent, 0))),
    downPaymentPercent: Math.max(0, Math.min(100, normalizeNumber(source.downPaymentPercent, 0))),
    monthlyInstallment: normalizeNumber(source.monthlyInstallment, 0),
    financingPeriodMonths,
    specialInstallments: normalizeSpecialInstallments(source.specialInstallments, financingPeriodMonths)
  };
}

function normalizeVehicleImageDataUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized || !normalized.startsWith('data:image/')) {
    return undefined;
  }

  return normalized;
}

function normalizeVehicleScenario(raw: RawScenario): VehicleScenario {
  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    createdAt:
      typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt:
      typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    modelVersion: 'vehicle-v2',
    name: typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : 'Escenario vehicular',
    initialCash: normalizeNumber(raw.initialCash, 0),
    vehicleFinancing: normalizeVehicleFinancing(raw.vehicleFinancing),
    financialProfileSnapshot: normalizeBudgetSettings(raw.financialProfileSnapshot),
    vehicleImageDataUrl: normalizeVehicleImageDataUrl(raw.vehicleImageDataUrl)
  };
}

function normalizeLegacyScenario(raw: RawScenario): LegacyScenario {
  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    createdAt:
      typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt:
      typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    modelVersion: 'legacy-v1',
    name: typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : 'Escenario legado',
    initialCash: normalizeNumber(raw.initialCash, 0),
    legacyData: {
      monthlySalary: normalizeNumber(raw.monthlySalary, 0),
      offerAmount: normalizeNumber(raw.offerAmount, 0),
      monthlyFixedExpenses: normalizeNumber(raw.monthlyFixedExpenses, 0),
      monthlyVariableExpenses: normalizeNumber(raw.monthlyVariableExpenses, 0),
      monthlyInvestmentContribution: normalizeNumber(raw.monthlyInvestmentContribution, 0),
      investmentAnnualReturnRate: normalizeNumber(raw.investmentAnnualReturnRate, 0),
      otherMonthlyIncome: normalizeNumber(raw.otherMonthlyIncome, 0),
      otherMonthlyExpenses: normalizeNumber(raw.otherMonthlyExpenses, 0),
      horizonMonths: normalizeNumber(raw.horizonMonths, 0)
    }
  };
}

function normalizeScenario(raw: RawScenario): Scenario {
  if (raw.modelVersion === 'vehicle-v2') {
    return normalizeVehicleScenario(raw);
  }

  return normalizeLegacyScenario(raw);
}

const emptyPayload: ScenarioStoragePayload = {
  version: STORAGE_VERSION,
  scenarios: []
};

function readPayload(): ScenarioStoragePayload {
  const payload = readStorage<ScenarioStoragePayload>(
    STORAGE_KEYS.scenarios,
    emptyPayload
  );

  if (!payload || !Array.isArray(payload.scenarios)) {
    return emptyPayload;
  }

  return {
    version:
      typeof payload.version === 'number' && payload.version === STORAGE_VERSION
        ? payload.version
        : STORAGE_VERSION,
    scenarios: payload.scenarios
      .map((scenario) => {
        if (!scenario || typeof scenario !== 'object') {
          return null;
        }

        return normalizeScenario(scenario as RawScenario);
      })
      .filter((scenario): scenario is Scenario => Boolean(scenario))
  };
}

function writePayload(payload: ScenarioStoragePayload): void {
  writeStorage(STORAGE_KEYS.scenarios, payload);
  writeStorage(STORAGE_KEYS.meta, {
    lastUpdatedAt: new Date().toISOString(),
    version: STORAGE_VERSION
  });
}

export const scenarioRepository = {
  async list(): Promise<Scenario[]> {
    return readPayload().scenarios;
  },

  async getById(id: string): Promise<Scenario | undefined> {
    return readPayload().scenarios.find((scenario) => scenario.id === id);
  },

  async create(input: ScenarioInput): Promise<VehicleScenario> {
    const payload = readPayload();
    const now = new Date().toISOString();

    const scenario: VehicleScenario = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      modelVersion: 'vehicle-v2',
      name: input.name,
      initialCash: input.initialCash,
      vehicleFinancing: normalizeVehicleFinancing(input.vehicleFinancing),
      financialProfileSnapshot: normalizeBudgetSettings(input.financialProfileSnapshot),
      vehicleImageDataUrl: normalizeVehicleImageDataUrl(input.vehicleImageDataUrl)
    };

    const nextPayload: ScenarioStoragePayload = {
      ...payload,
      scenarios: [scenario, ...payload.scenarios]
    };

    writePayload(nextPayload);
    return scenario;
  },

  async update(id: string, input: ScenarioInput): Promise<VehicleScenario> {
    const payload = readPayload();
    const current = payload.scenarios.find((item) => item.id === id);

    if (!current) {
      throw new Error('Escenario no encontrado');
    }

    const nextScenario: VehicleScenario = {
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
      modelVersion: 'vehicle-v2',
      name: input.name,
      initialCash: input.initialCash,
      vehicleFinancing: normalizeVehicleFinancing(input.vehicleFinancing),
      financialProfileSnapshot: normalizeBudgetSettings(input.financialProfileSnapshot),
      vehicleImageDataUrl: normalizeVehicleImageDataUrl(input.vehicleImageDataUrl)
    };

    const nextPayload: ScenarioStoragePayload = {
      ...payload,
      scenarios: payload.scenarios.map((scenario) => (scenario.id === id ? nextScenario : scenario))
    };

    writePayload(nextPayload);
    return nextScenario;
  },

  async remove(id: string): Promise<void> {
    const payload = readPayload();
    const nextPayload: ScenarioStoragePayload = {
      ...payload,
      scenarios: payload.scenarios.filter((scenario) => scenario.id !== id)
    };

    writePayload(nextPayload);
  }
};
