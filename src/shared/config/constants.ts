export const APP_NAME = 'Evaluación de Presupuestos';
export const DEFAULT_HORIZON_MONTHS = 12;
export const MIN_HORIZON_MONTHS = 1;
export const MAX_HORIZON_MONTHS = 24;

export const STORAGE_KEYS = {
  scenarios: 'budget-evaluation:scenarios:v1',
  meta: 'budget-evaluation:meta:v1',
  settings: 'budget-evaluation:settings:v1'
} as const;

export const STORAGE_VERSION = 1;

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_CURRENCY = 'USD';
