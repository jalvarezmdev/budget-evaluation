import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { CircleHelp } from 'lucide-react';
import { evaluateScenario } from '@/entities/budget/calculations';
import { scenarioInputSchema, type ScenarioInputForm } from '@/entities/budget/schema';
import type { BudgetSettings, SpecialInstallment } from '@/entities/budget/types';
import { defaultBudgetSettings } from '@/features/settings/model/settings-schema';
import { formatCurrency } from '@/shared/lib/currency';
import { toNumber } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/shared/lib/utils';

export const defaultScenarioFormValues: ScenarioInputForm = {
  name: '',
  initialCash: 0,
  vehiclePrice: 0,
  financingPlanPercent: 80,
  downPaymentPercent: 20,
  monthlyInstallment: 0,
  financingPeriodMonths: 48,
  specialInstallments: [],
  vehicleImageDataUrl: ''
};

const MAX_IMAGE_FILE_SIZE_BYTES = 2 * 1024 * 1024;

type ScenarioFormProps = {
  initialValues?: ScenarioInputForm;
  financialProfile: BudgetSettings;
  onSubmit: (values: ScenarioInputForm) => Promise<void> | void;
  submitLabel: string;
  isSubmitting?: boolean;
};

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null;
  }

  return String(error.message);
}

type NumberFieldProps = {
  id: Exclude<keyof ScenarioInputForm, 'name' | 'specialInstallments' | 'vehicleImageDataUrl'>;
  label: string;
  step?: string;
  form: ReturnType<typeof useForm<ScenarioInputForm>>;
};

function NumberField({ id, label, step = '0.01', form }: NumberFieldProps) {
  const errorMessage = getErrorMessage(form.formState.errors[id]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step={step} {...form.register(id, { valueAsNumber: true })} />
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

type SummaryMetricItemProps = {
  label: string;
  value: string;
  description: string;
};

function SummaryMetricItem({ label, value, description }: SummaryMetricItemProps) {
  return (
    <p className="rounded-md border border-white/10 bg-background/40 px-3 py-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="group relative inline-flex items-center">
          <button
            type="button"
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground',
              'hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
            aria-label={description}
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
          <span
            role="tooltip"
            className={cn(
              'pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-md border border-white/15 bg-secondary/95 px-2 py-1.5 text-[11px] leading-relaxed text-foreground shadow-soft',
              'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100'
            )}
          >
            {description}
          </span>
        </span>
        <span>{label}:</span>
      </span>{' '}
      <strong>{value}</strong>
    </p>
  );
}

export function ScenarioForm({
  initialValues,
  financialProfile,
  onSubmit,
  submitLabel,
  isSubmitting = false
}: ScenarioFormProps) {
  const form = useForm<ScenarioInputForm>({
    resolver: zodResolver(scenarioInputSchema),
    defaultValues: initialValues ?? defaultScenarioFormValues
  });

  const [imagePreviewError, setImagePreviewError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const specialInstallmentsFieldArray = useFieldArray({
    control: form.control,
    name: 'specialInstallments'
  });

  const values = form.watch();
  const imageDataUrl = values.vehicleImageDataUrl ?? '';

  const liveEvaluation = useMemo(() => {
    if (!values.name) {
      return null;
    }

    const specialInstallments = (values.specialInstallments ?? []).map((installment, index) => ({
      id: installment.id ?? `special-${index}`,
      month: toNumber(installment.month),
      amount: toNumber(installment.amount)
    }));

    return evaluateScenario({
      name: values.name,
      initialCash: toNumber(values.initialCash),
      vehicleFinancing: {
        vehiclePrice: toNumber(values.vehiclePrice),
        financingPlanPercent: toNumber(values.financingPlanPercent),
        downPaymentPercent: toNumber(values.downPaymentPercent),
        monthlyInstallment: toNumber(values.monthlyInstallment),
        financingPeriodMonths: toNumber(values.financingPeriodMonths),
        specialInstallments: specialInstallments as SpecialInstallment[]
      },
      financialProfileSnapshot: financialProfile ?? defaultBudgetSettings
    });
  }, [financialProfile, values]);

  const downPaymentAmount =
    toNumber(values.vehiclePrice) * (toNumber(values.downPaymentPercent) / 100);
  const monthOneSpecialInstallments = (values.specialInstallments ?? [])
    .filter((installment) => toNumber(installment.month) === 1)
    .reduce((sum, installment) => sum + toNumber(installment.amount), 0);
  const initialPaymentAmount = downPaymentAmount + monthOneSpecialInstallments;

  const nameError = getErrorMessage(form.formState.errors.name);

  async function handleImageSelection(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImagePreviewError('Selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      setImagePreviewError('La imagen supera el límite de 2 MB.');
      return;
    }

    try {
      const nextImageDataUrl = await fileToDataUrl(file);

      form.setValue('vehicleImageDataUrl', nextImageDataUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      setImagePreviewError(null);
    } catch {
      setImagePreviewError('No fue posible procesar la imagen seleccionada.');
    }
  }

  function clearImage() {
    form.setValue('vehicleImageDataUrl', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    setImagePreviewError(null);
    setIsImageModalOpen(false);
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>Formulario de escenario</CardTitle>
          <CardDescription>
            Ingresa los datos del financiamiento para evaluar si la oferta del vehículo encaja con tu bolsillo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <input type="hidden" {...form.register('vehicleImageDataUrl')} />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del escenario</Label>
              <Input id="name" placeholder="Ejemplo: SUV 2026 - Oferta Banco A" {...form.register('name')} />
              {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
            </div>

            <p className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-primary">
              Flujo inicial y datos del crédito
            </p>

            <NumberField form={form} id="initialCash" label="Dinero disponible actual" />
            <NumberField form={form} id="vehiclePrice" label="Precio del vehículo" />
            <NumberField form={form} id="downPaymentPercent" label="% de inicial" />
            <NumberField form={form} id="financingPlanPercent" label="Plan de financiamiento (%)" />
            <NumberField form={form} id="monthlyInstallment" label="Cuota mensual" />
            <NumberField
              form={form}
              id="financingPeriodMonths"
              label="Periodo de financiamiento (meses)"
              step="1"
            />

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cuotas especiales</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    specialInstallmentsFieldArray.append({
                      id: `special-${Date.now()}`,
                      month: 1,
                      amount: 0
                    });
                  }}
                >
                  Agregar cuota especial
                </Button>
              </div>

              {specialInstallmentsFieldArray.fields.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hay cuotas especiales registradas.</p>
              ) : null}

              {specialInstallmentsFieldArray.fields.map((field, index) => {
                const monthError = getErrorMessage(form.formState.errors.specialInstallments?.[index]?.month);
                const amountError = getErrorMessage(form.formState.errors.specialInstallments?.[index]?.amount);

                return (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-lg border border-white/10 bg-background/30 p-3 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <div className="space-y-1">
                      <Label htmlFor={`specialInstallments.${index}.month`}>Mes</Label>
                      <Input
                        id={`specialInstallments.${index}.month`}
                        type="number"
                        step="1"
                        {...form.register(`specialInstallments.${index}.month`, {
                          valueAsNumber: true
                        })}
                      />
                      {monthError ? <p className="text-xs text-destructive">{monthError}</p> : null}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`specialInstallments.${index}.amount`}>Monto</Label>
                      <Input
                        id={`specialInstallments.${index}.amount`}
                        type="number"
                        step="0.01"
                        {...form.register(`specialInstallments.${index}.amount`, {
                          valueAsNumber: true
                        })}
                      />
                      {amountError ? <p className="text-xs text-destructive">{amountError}</p> : null}
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => specialInstallmentsFieldArray.remove(index)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Imagen de referencia</p>
              <div className="rounded-lg border border-white/10 bg-background/30 p-3">
                <div className="space-y-2">
                  <Label htmlFor="vehicleImageDataUrl-upload">Guardar imagen</Label>
                  <Input
                    id="vehicleImageDataUrl-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      await handleImageSelection(file);
                      event.target.value = '';
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes guardar una foto de la oferta o del vehículo (máximo 2 MB).
                  </p>
                  {imagePreviewError ? (
                    <p className="text-xs text-destructive">{imagePreviewError}</p>
                  ) : null}
                </div>

                {imageDataUrl ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Preview</p>
                    <button
                      type="button"
                      className="w-full overflow-hidden rounded-lg border border-white/10 bg-secondary/40"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img
                        src={imageDataUrl}
                        alt="Preview de oferta vehicular"
                        className="h-44 w-full object-cover"
                      />
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsImageModalOpen(true)}>
                        Ver imagen completa
                      </Button>
                      <Button type="button" variant="destructive" onClick={clearImage}>
                        Quitar imagen
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen en vivo</CardTitle>
          <CardDescription>Resultados estimados con tu perfil financiero de configuración.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryMetricItem
            label="Inicial calculada"
            value={formatCurrency(initialPaymentAmount)}
            description="Es el pago inicial aproximado al comprar el vehículo: inicial + cuotas especiales del mes 1."
          />
          <SummaryMetricItem
            label="Flujo libre mensual"
            value={formatCurrency(liveEvaluation?.avgMonthlyFreeCash ?? 0)}
            description="Es el dinero que normalmente te quedaría cada mes después de tus ingresos, gastos del hogar y cuota del vehículo."
          />
          <SummaryMetricItem
            label="Meses en negativo"
            value={String(liveEvaluation?.negativeMonths ?? 0)}
            description="Cantidad de meses en los que te faltaría dinero para cubrir todos tus pagos."
          />
          <SummaryMetricItem
            label="Caja mínima"
            value={formatCurrency(liveEvaluation?.minCashBalance ?? 0)}
            description="Es el punto más bajo de dinero disponible que tendrías durante todo el financiamiento."
          />
          <SummaryMetricItem
            label="Caja final"
            value={formatCurrency(liveEvaluation?.endingCash ?? 0)}
            description="Dinero disponible estimado al terminar el último mes del plan de financiamiento."
          />
          <SummaryMetricItem
            label="Costo total del vehículo"
            value={formatCurrency(liveEvaluation?.totalVehicleCost ?? 0)}
            description="Total que terminarías pagando por el vehículo: inicial, cuotas mensuales y cuotas especiales."
          />
        </CardContent>
      </Card>
      </div>

      {isImageModalOpen && imageDataUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <button
          type="button"
          className="absolute inset-0 h-full w-full cursor-pointer"
          aria-label="Cerrar modal de imagen"
          onClick={() => setIsImageModalOpen(false)}
        />
        <div className="relative z-10 w-full max-w-5xl rounded-xl border border-white/10 bg-secondary p-3 shadow-glow">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Imagen guardada</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsImageModalOpen(false)}>
              Cerrar
            </Button>
          </div>
          <img
            src={imageDataUrl}
            alt="Imagen completa de la oferta vehicular"
            className="max-h-[75vh] w-full rounded-lg object-contain"
          />
        </div>
        </div>
      ) : null}
    </>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('No fue posible leer la imagen.'));
    };
    reader.onerror = () => {
      reject(new Error('No fue posible leer la imagen.'));
    };
    reader.readAsDataURL(file);
  });
}
