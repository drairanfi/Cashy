import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { ModalHeader } from '../../molecules/ModalHeader';
import { useInsights, useRefreshInsights } from '../../../hooks/useInsights';
import type { InsightTipo } from '../../../types';

const TONES: Record<InsightTipo, 'danger' | 'warning' | 'neutral'> = {
  alerta: 'danger',
  sugerencia: 'warning',
  info: 'neutral',
};

const LABELS: Record<InsightTipo, string> = {
  alerta: 'Alerta',
  sugerencia: 'Sugerencia',
  info: 'Dato',
};

interface InsightPanelProps {
  open: boolean;
  onClose: () => void;
}

export function InsightPanel({ open, onClose }: InsightPanelProps) {
  const { data, isLoading, isError } = useInsights();
  const refresh = useRefreshInsights();

  if (!open) return null;

  const insights = data?.insights ?? [];
  const enabled = data?.enabled ?? true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Notificaciones de Cashy" onClose={onClose} />
        <div className="modal__body">
          {!enabled ? (
            <p className="section__empty">El asistente IA no está configurado.</p>
          ) : isLoading ? (
            <p className="section__empty">Analizando tus finanzas...</p>
          ) : isError ? (
            <p className="section__empty">No pudimos generar las notificaciones. Probá de nuevo.</p>
          ) : insights.length === 0 ? (
            <p className="section__empty">Todo en orden, no hay novedades por ahora.</p>
          ) : (
            <div className="insight-list">
              {insights.map((insight) => (
                <div key={insight.id} className={`insight-card insight-card--${insight.tipo}`}>
                  <div className="insight-card__header">
                    <Badge tone={TONES[insight.tipo]}>{LABELS[insight.tipo]}</Badge>
                  </div>
                  <p className="insight-card__titulo">{insight.titulo}</p>
                  <p className="insight-card__mensaje">{insight.mensaje}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="insight-panel__actions mt-4">
          <Button
            variant="outline"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || !enabled}
          >
            {refresh.isPending ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
