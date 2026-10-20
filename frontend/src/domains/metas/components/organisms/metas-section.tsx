import { Target } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { Button } from '@/components/ui/button';
import type { Meta } from '@/types/meta.types';

import { MetaCard } from '../molecules/meta-card';
import { metasMessages } from '../../messages';

interface MetasSectionProps {
  metas: Meta[];
  onCreate: () => void;
  onEdit: (meta: Meta) => void;
}

export function MetasSection({ metas, onCreate, onEdit }: MetasSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{metasMessages.sectionTitle}</h2>
        <Button variant="ghost" size="sm" onClick={onCreate}>
          {metasMessages.addAction}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {metas.length === 0 ? (
          <EmptyState
            icon={<Target className="size-5" />}
            title={metasMessages.empty.title}
            text={metasMessages.empty.text}
            actionLabel={metasMessages.empty.action}
            onAction={onCreate}
          />
        ) : (
          metas.map(meta => <MetaCard key={meta.id} meta={meta} onEdit={onEdit} />)
        )}
      </div>
    </section>
  );
}
