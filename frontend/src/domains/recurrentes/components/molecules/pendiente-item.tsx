import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { recurrentesMessages } from '../../messages';
import type { RecurrenteOcurrencia } from '../../types/recurrente.types';

interface PendienteItemProps {
  ocurrencia: RecurrenteOcurrencia;
  isPending: boolean;
  onConfirmar: (ocurrencia: RecurrenteOcurrencia) => void;
  onOmitir: (ocurrencia: RecurrenteOcurrencia) => void;
}

export function PendienteItem({
  ocurrencia,
  isPending,
  onConfirmar,
  onOmitir
}: PendienteItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{ocurrencia.concepto}</p>
        <p className="text-xs text-muted-foreground">
          {recurrentesMessages.pendientes.date(formatDate(ocurrencia.fecha))}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(ocurrencia.monto)}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOmitir(ocurrencia)}
          disabled={isPending}
        >
          <X className="size-3.5" />
          {recurrentesMessages.pendientes.omit}
        </Button>
        <Button size="sm" onClick={() => onConfirmar(ocurrencia)} disabled={isPending}>
          <Check className="size-3.5" />
          {recurrentesMessages.pendientes.confirm}
        </Button>
      </div>
    </div>
  );
}
