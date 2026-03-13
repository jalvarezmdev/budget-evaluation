# Evaluación de Presupuestos (v1)

Aplicación web para crear y comparar escenarios de presupuesto a 12 meses, priorizando la mejor opción por **patrimonio neto final**. Está orientada principalmente a evaluar ofertas de vehículos según tu bolsillo.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + componentes estilo shadcn
- React Router
- TanStack Query
- React Hook Form + Zod
- Vitest + Testing Library

## Design System (UI)

- Primary: `#38BDF8`
- Secondary: `#1E293B`
- Tertiary: `#4ADE80`
- Neutral: `#0F172A`

## Scripts

- `npm run dev`: iniciar entorno local
- `npm run build`: compilar proyecto
- `npm run test`: ejecutar pruebas
- `npm run test:watch`: ejecutar pruebas en modo observación

## Funcionalidades v1

- CRUD de escenarios
- Página de configuración con perfil financiero base
- Persistencia local con versionado (`localStorage`)
- Cálculo de proyecciones y ranking automático
- Vista comparativa de resultados
