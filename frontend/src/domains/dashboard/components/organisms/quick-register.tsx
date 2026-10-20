'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ComidaModal } from '@/domains/comidas/components/organisms/comida-modal';
import { GastoModal } from '@/domains/gastos/components/organisms/gasto-modal';
import { GimnasioModal } from '@/domains/gimnasio/components/organisms/gimnasio-modal';
import { cn } from '@/lib/utils';
import type { MovimientoTipo } from '@/types/movimiento.types';

import { dashboardMessages } from '../../messages';

const TYPES: { value: MovimientoTipo; label: string }[] = [
  { value: 'gasto', label: dashboardMessages.recentMovements.types.gasto },
  { value: 'comida', label: dashboardMessages.recentMovements.types.comida },
  { value: 'gimnasio', label: dashboardMessages.recentMovements.types.gimnasio }
];

export function QuickRegister() {
  const [type, setType] = useState<MovimientoTipo>('gasto');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleCreated = () => setFeedback(dashboardMessages.quickRegister.feedback[type]);

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      aria-label={dashboardMessages.quickRegister.title}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {dashboardMessages.quickRegister.title}
        </h2>
        {feedback && (
          <span role="status" className="text-sm font-medium text-emerald-600">
            {feedback}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="radiogroup"
          aria-label={dashboardMessages.quickRegister.title}
          className="flex rounded-full bg-muted p-1"
        >
          {TYPES.map(item => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={type === item.value}
              onClick={() => setType(item.value)}
              className={cn(
                'flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                type === item.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          {dashboardMessages.quickRegister.action}
        </Button>
      </div>

      {type === 'gasto' && (
        <GastoModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
      {type === 'comida' && (
        <ComidaModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
      {type === 'gimnasio' && (
        <GimnasioModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </section>
  );
}
