import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  DEFAULT_HORIZON_MONTHS
} from '@/shared/config/constants';
import { generateId } from '@/shared/lib/id';
import { readStorage, writeStorage } from '@/shared/lib/storage';
import type { Scenario, ScenarioInput, ScenarioStoragePayload } from '@/entities/budget/types';

const emptyPayload: ScenarioStoragePayload = {
  version: STORAGE_VERSION,
  scenarios: []
};

function readPayload(): ScenarioStoragePayload {
  const payload = readStorage<ScenarioStoragePayload>(STORAGE_KEYS.scenarios, emptyPayload);

  if (payload.version !== STORAGE_VERSION || !Array.isArray(payload.scenarios)) {
    return emptyPayload;
  }

  return payload;
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

  async create(input: ScenarioInput): Promise<Scenario> {
    const payload = readPayload();
    const now = new Date().toISOString();

    const scenario: Scenario = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      ...input,
      horizonMonths: input.horizonMonths ?? DEFAULT_HORIZON_MONTHS,
      otherMonthlyIncome: input.otherMonthlyIncome ?? 0,
      otherMonthlyExpenses: input.otherMonthlyExpenses ?? 0
    };

    const nextPayload: ScenarioStoragePayload = {
      ...payload,
      scenarios: [scenario, ...payload.scenarios]
    };

    writePayload(nextPayload);
    return scenario;
  },

  async update(id: string, input: ScenarioInput): Promise<Scenario> {
    const payload = readPayload();
    const current = payload.scenarios.find((item) => item.id === id);

    if (!current) {
      throw new Error('Escenario no encontrado');
    }

    const nextScenario: Scenario = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
      horizonMonths: input.horizonMonths ?? DEFAULT_HORIZON_MONTHS,
      otherMonthlyIncome: input.otherMonthlyIncome ?? 0,
      otherMonthlyExpenses: input.otherMonthlyExpenses ?? 0
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
