'use client';

import { Volume2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { aiMessages } from '../../messages';

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  canSpeak: boolean;
  isSpeaking: boolean;
  onToggleSpeak: () => void;
}

export function ChatMessageBubble({
  role,
  content,
  canSpeak,
  isSpeaking,
  onToggleSpeak
}: ChatMessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        <p className="whitespace-pre-line">{content}</p>
        {!isUser && canSpeak && (
          <button
            type="button"
            onClick={onToggleSpeak}
            aria-label={aiMessages.chat.readAloud}
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Volume2 className="size-3.5" />
            {isSpeaking ? aiMessages.chat.stopSpeak : aiMessages.chat.speak}
          </button>
        )}
      </div>
    </div>
  );
}
