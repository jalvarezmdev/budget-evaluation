import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScenarioForm } from '@/features/scenarios/ui/scenario-form';
import { defaultBudgetSettings } from '@/features/settings/model/settings-schema';

const financialProfile = {
  ...defaultBudgetSettings,
  monthlySalary: 4_000,
  monthlyFixedExpenses: 1_300,
  monthlyVariableExpenses: 500
};

describe('ScenarioForm', () => {
  it('submits valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ScenarioForm
        onSubmit={onSubmit}
        submitLabel="Guardar"
        financialProfile={financialProfile}
      />
    );

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'Plan Alpha');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];

    expect(payload.name).toBe('Plan Alpha');
    expect(typeof payload.initialCash).toBe('number');
    expect(typeof payload.vehiclePrice).toBe('number');
    expect(Array.isArray(payload.specialInstallments)).toBe(true);
  });

  it('shows validation errors from zod schema', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ScenarioForm
        onSubmit={onSubmit}
        submitLabel="Guardar"
        financialProfile={financialProfile}
      />
    );

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'A');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('converts numeric string input into number fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ScenarioForm
        onSubmit={onSubmit}
        submitLabel="Guardar"
        financialProfile={financialProfile}
      />
    );

    const initialCashInput = screen.getByLabelText(/dinero disponible actual/i);
    await user.clear(initialCashInput);
    await user.type(initialCashInput, '1500');

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'Plan Numeric');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.initialCash).toBe(1500);
  });
});

