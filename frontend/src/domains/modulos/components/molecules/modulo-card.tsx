import { ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';

import { IconAction } from '@/components/molecules/icon-action';
import { cn } from '@/lib/utils';

import { modulosMessages } from '../../messages';

interface ModuloCardProps {
  label: string;
  href: string;
  tag?: string;
  note?: string;
  activo?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

export function ModuloCard({
  label,
  href,
  tag,
  note,
  activo,
  onToggle,
  onDelete
}: ModuloCardProps) {
  const hasStatus = activo !== undefined;
  const status = activo ? modulosMessages.optional.active : modulosMessages.optional.hidden;
  const subtitle = note ?? (hasStatus ? status : undefined);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">{label}</p>
          {tag && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {tag}
            </span>
          )}
        </div>
        {subtitle && (
          <p className={cn('text-sm', hasStatus && activo ? 'text-primary' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconAction label={modulosMessages.actions.open} icon={ExternalLink} href={href} />
        {onToggle && (
          <IconAction
            label={activo ? modulosMessages.actions.hide : modulosMessages.actions.show}
            icon={activo ? Eye : EyeOff}
            onClick={onToggle}
          />
        )}
        {onDelete && (
          <IconAction
            label={modulosMessages.actions.delete}
            icon={Trash2}
            onClick={onDelete}
            destructive
          />
        )}
      </div>
    </div>
  );
}
