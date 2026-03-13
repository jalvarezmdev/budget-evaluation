import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-secondary/45 p-8 text-center">
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">La página que buscas no existe o fue movida dentro del panel de evaluación.</p>
      <Link className={buttonVariants({ variant: 'default' })} to="/">
        Volver al inicio
      </Link>
    </div>
  );
}
