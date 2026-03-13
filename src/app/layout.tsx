import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Calculator,
  CarFront,
  CircleDollarSign,
  Home,
  Settings
} from 'lucide-react';
import { APP_NAME } from '@/shared/config/constants';
import { cn } from '@/shared/lib/utils';

const navItemClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
    isActive
      ? 'bg-primary text-primary-foreground shadow-glow'
      : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
  );

const navItemClassNameMobile = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'
  );

const pageMetadata: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Panel de evaluación vehicular',
    subtitle: 'Compara presupuestos y ofertas de vehículos según tu capacidad financiera.'
  },
  '/scenarios/new': {
    title: 'Nuevo escenario',
    subtitle: 'Construye una propuesta y evalúa su impacto en tu bolsillo.'
  },
  '/compare': {
    title: 'Comparación de escenarios',
    subtitle: 'Analiza cuál opción mantiene mejor balance entre liquidez e inversión.'
  },
  '/settings': {
    title: 'Configuración financiera base',
    subtitle: 'Define tus montos mensuales para iniciar evaluaciones más rápido.'
  }
};

export function AppLayout() {
  const { pathname } = useLocation();
  const page =
    pageMetadata[pathname] ??
    pageMetadata[pathname.startsWith('/scenarios/') ? '/scenarios/new' : '/'];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-secondary/55 px-4 py-5 lg:flex lg:flex-col">
          <div className="glass-panel p-4">
            <Link to="/" className="inline-flex items-center gap-3 text-base font-semibold text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CircleDollarSign className="h-5 w-5" />
              </span>
              <span>{APP_NAME}</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Evaluador de ofertas y presupuesto automotriz</p>
          </div>

          <nav className="mt-5 space-y-2">
            <NavLink className={navItemClassName} to="/">
              <Home className="h-4 w-4" /> Inicio
            </NavLink>
            <NavLink className={navItemClassName} to="/scenarios/new">
              <CarFront className="h-4 w-4" /> Nuevo escenario
            </NavLink>
            <NavLink className={navItemClassName} to="/compare">
              <Calculator className="h-4 w-4" /> Comparar
            </NavLink>
            <NavLink className={navItemClassName} to="/settings">
              <Settings className="h-4 w-4" /> Configuración
            </NavLink>
          </nav>

          <div className="mt-auto rounded-xl border border-tertiary/30 bg-tertiary/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Tip de evaluación</p>
            <p className="mt-1 text-sm text-tertiary/90">
              Prioriza escenarios donde el pago mensual del vehículo no comprometa tu flujo mensual promedio.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-secondary/40 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">{page.title}</h1>
                <p className="text-sm text-muted-foreground">{page.subtitle}</p>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
              <NavLink className={navItemClassNameMobile} to="/">
                Inicio
              </NavLink>
              <NavLink className={navItemClassNameMobile} to="/scenarios/new">
                Nuevo escenario
              </NavLink>
              <NavLink className={navItemClassNameMobile} to="/compare">
                Comparar
              </NavLink>
              <NavLink className={navItemClassNameMobile} to="/settings">
                Configuración
              </NavLink>
            </nav>
          </header>

          <main className="page-container">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
