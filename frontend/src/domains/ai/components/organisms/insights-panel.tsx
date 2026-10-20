'use client';

import { Modal } from '@/components/molecules/modal';
import { ModalHeader } from '@/components/molecules/modal-header';
import { Button } from '@/components/ui/button';

import { useInsights, useRefreshInsights } from '../../hooks/use-insights';
import { aiMessages } from '../../messages';
import { InsightCard } from '../molecules/insight-card';

interface InsightsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function InsightsPanel({ open, onClose }: InsightsPanelProps) {
  const { data, isLoading, isError } = useInsights();
  const refresh = useRefreshInsights();

  const insights = data?.insights ?? [];
  const isEnabled = data?.enabled ?? true;

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <ModalHeader title={aiMessages.insights.title} onClose={onClose} />

      <div className="flex flex-col gap-3">
        {!isEnabled ? (
          <p className="text-sm text-muted-foreground">{aiMessages.insights.disabled}</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">{aiMessages.insights.loading}</p>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">{aiMessages.insights.error}</p>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">{aiMessages.insights.empty}</p>
        ) : (
          insights.map(insight => <InsightCard key={insight.id} insight={insight} />)
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || !isEnabled}
        >
          {refresh.isPending ? aiMessages.insights.refreshing : aiMessages.insights.refresh}
        </Button>
      </div>
    </Modal>
  );
}
