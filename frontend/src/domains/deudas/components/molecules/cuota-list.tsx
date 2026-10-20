import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Cuota } from '@/types/deuda.types';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { deudasMessages } from '../../messages';

interface CuotaListProps {
  cuotas: Cuota[];
  isPaying: boolean;
  onPagar: (numero: number) => void;
}

export function CuotaList({ cuotas, isPaying, onPagar }: CuotaListProps) {
  return (
    <ul className="ml-3 flex flex-col gap-2 border-l-2 border-border pl-3">
      {cuotas.map(cuota => {
        const isPaid = cuota.estado === 'pagada';

        return (
          <li key={cuota.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm font-medium',
                  isPaid ? 'text-muted-foreground line-through' : 'text-foreground'
                )}
              >
                {deudasMessages.cuota.number(cuota.numero)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(cuota.fechaVencimiento)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm text-foreground">{formatCurrency(cuota.monto)}</span>
              {isPaid ? (
                <Badge tone="success">{deudasMessages.cuota.paid}</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPaying}
                  onClick={() => onPagar(cuota.numero)}
                >
                  {deudasMessages.cuota.pay}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
