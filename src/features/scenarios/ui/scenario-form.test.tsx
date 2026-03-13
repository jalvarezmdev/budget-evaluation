import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScenarioForm } from '@/features/scenarios/ui/scenario-form';

describe('ScenarioForm', () => {
  it('submits valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ScenarioForm onSubmit={onSubmit} submitLabel="Guardar" />);

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'Plan Alpha');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];

    expect(payload.name).toBe('Plan Alpha');
    expect(typeof payload.initialCash).toBe('number');
    expect(typeof payload.monthlySalary).toBe('number');
  });

  it('shows validation errors from zod schema', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ScenarioForm onSubmit={onSubmit} submitLabel="Guardar" />);

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'A');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('converts numeric string input into number fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ScenarioForm onSubmit={onSubmit} submitLabel="Guardar" />);

    const initialCashInput = screen.getByLabelText(/dinero inicial/i);
    await user.clear(initialCashInput);
    await user.type(initialCashInput, '1500');

    await user.type(screen.getByLabelText(/nombre del escenario/i), 'Plan Numeric');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.initialCash).toBe(1500);
  });
});
