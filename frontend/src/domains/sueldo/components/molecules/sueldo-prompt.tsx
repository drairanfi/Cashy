import { Wallet } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';

import { sueldoMessages } from '../../messages';

interface SueldoPromptProps {
  onConfigure: () => void;
}

export function SueldoPrompt({ onConfigure }: SueldoPromptProps) {
  return (
    <EmptyState
      icon={<Wallet className="size-5" />}
      title={sueldoMessages.prompt.title}
      text={sueldoMessages.prompt.text}
      actionLabel={sueldoMessages.prompt.action}
      onAction={onConfigure}
    />
  );
}
