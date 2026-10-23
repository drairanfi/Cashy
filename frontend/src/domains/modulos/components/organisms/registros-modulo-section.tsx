import { Wallet } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { RegistroModulo } from '@/types/modulo.types';
import { formatCurrency } from '@/utils/format.util';

import { RegistroModuloCard } from '../molecules/registro-modulo-card';
import { modulosMessages } from '../../messages';

interface RegistrosModuloSectionProps {
  moduloNombre: string;
  registros: RegistroModulo[];
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (registro: RegistroModulo) => void;
}

export function RegistrosModuloSection({
  moduloNombre,
  registros,
  isLoading,
  onCreate,
  onDelete
}: RegistrosModuloSectionProps) {
  const total = registros.reduce((acc, registro) => acc + registro.monto, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{moduloNombre}</h1>
          <p className="text-sm text-muted-foreground">
            {modulosMessages.registro.totalLabel(formatCurrency(total))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {modulosMessages.registro.add}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : registros.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" />}
          title={modulosMessages.registro.empty.title}
          text={modulosMessages.registro.empty.text}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {registros.map(registro => (
            <RegistroModuloCard
              key={registro.id}
              registro={registro}
              moduloNombre={moduloNombre}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
