'use client';

import { Mic, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AiAction, AiChatMessage } from '@/types/ai.types';

import { useChat, useConfirmActions } from '../../hooks/use-chat';
import { useAiStatus } from '../../hooks/use-insights';
import { useSpeech } from '../../hooks/use-speech';
import { aiMessages } from '../../messages';
import { ChatActionCard, type ChatActionStatus } from '../molecules/chat-action-card';
import { ChatMessageBubble } from '../molecules/chat-message-bubble';
import { normalizeTranscript, stripWakeWord } from '../../utils/speech.util';

type ChatItem =
  | { key: string; kind: 'message'; role: 'user' | 'assistant'; content: string }
  | { key: string; kind: 'action'; action: AiAction; status: ChatActionStatus };

const uid = () => crypto.randomUUID();

function toApiMessages(items: ChatItem[]): AiChatMessage[] {
  return items
    .filter(
      (item): item is Extract<ChatItem, { kind: 'message' }> =>
        item.kind === 'message' && item.content.trim().length > 0
    )
    .map(item => ({ role: item.role, content: item.content }));
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const chat = useChat();
  const confirm = useConfirmActions();
  const { data: aiStatus } = useAiStatus();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    recognitionSupported,
    synthesisSupported,
    isListening,
    isSpeaking,
    interimTranscript,
    speechError,
    clearSpeechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useSpeech({
    onResult: transcript => {
      const content = stripWakeWord(normalizeTranscript(transcript));
      if (!content) return;
      setInput(prev => (prev ? `${prev} ${content}` : content));
    }
  });

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, chat.isPending, confirm.isPending, isOpen]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || chat.isPending) return;

    const next: ChatItem[] = [...items, { key: uid(), kind: 'message', role: 'user', content }];
    setItems(next);
    setInput('');
    setError(null);
    clearSpeechError();

    chat.mutate(toApiMessages(next), {
      onSuccess: data => {
        const additions: ChatItem[] = [];
        if (data.reply) {
          additions.push({ key: uid(), kind: 'message', role: 'assistant', content: data.reply });
        }
        for (const action of data.actions) {
          additions.push({ key: uid(), kind: 'action', action, status: 'pending' });
        }
        setItems(prev => [...prev, ...additions]);
      },
      onError: err => {
        setError(err instanceof Error ? err.message : aiMessages.chat.fallbackReplyError);
      }
    });
  };

  const handleConfirm = (itemKey: string, action: AiAction) => {
    setItems(prev =>
      prev.map(item => (item.key === itemKey ? { ...item, status: 'executing' } : item))
    );
    setError(null);

    confirm.mutate([action], {
      onSuccess: data => {
        setItems(prev => [
          ...prev.map(item =>
            item.key === itemKey
              ? ({ ...item, status: 'done' } as ChatItem)
              : item
          ),
          ...(data.reply
            ? [
                {
                  key: uid(),
                  kind: 'message',
                  role: 'assistant',
                  content: data.reply
                } as ChatItem
              ]
            : [])
        ]);
      },
      onError: err => {
        setItems(prev =>
          prev.map(item =>
            item.key === itemKey
              ? ({ ...item, status: 'pending' } as ChatItem)
              : item
          )
        );
        setError(err instanceof Error ? err.message : aiMessages.chat.fallbackActionError);
      }
    });
  };

  const handleCancel = (itemKey: string) => {
    setItems(prev =>
      prev.map(item => (item.key === itemKey ? { ...item, status: 'cancelled' } : item))
    );
  };

  if (aiStatus && !aiStatus.enabled) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={aiMessages.chat.fabLabel}
        className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
      >
        <Sparkles className="size-6" />
      </button>
    );
  }

  return (
    <section
      aria-label={aiMessages.chat.panelLabel}
      className="fixed bottom-20 right-4 z-40 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:bottom-6 lg:right-6"
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        <div>
          <p className="text-sm font-bold text-foreground">{aiMessages.chat.title}</p>
          <p className="text-xs text-muted-foreground">{aiMessages.chat.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={aiMessages.chat.closeLabel}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{aiMessages.chat.empty}</p>
        )}

        {items.map(item => {
          if (item.kind === 'action') {
            return (
              <ChatActionCard
                key={item.key}
                action={item.action}
                status={item.status}
                onConfirm={() => handleConfirm(item.key, item.action)}
                onCancel={() => handleCancel(item.key)}
              />
            );
          }

          return (
            <ChatMessageBubble
              key={item.key}
              role={item.role}
              content={item.content}
              canSpeak={synthesisSupported}
              isSpeaking={isSpeaking}
              onToggleSpeak={() => (isSpeaking ? stopSpeaking() : speak(item.content))}
            />
          );
        })}

        {chat.isPending && (
          <p className="text-sm text-muted-foreground">{aiMessages.chat.thinking}</p>
        )}
        {(speechError ?? error) && (
          <p className="text-xs text-destructive">{speechError ?? error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={event => {
          event.preventDefault();
          handleSend();
        }}
      >
        {recognitionSupported && (
          <button
            type="button"
            onClick={() => {
              if (isListening) stopListening();
              else void startListening();
            }}
            aria-label={isListening ? aiMessages.chat.stopDictating : aiMessages.chat.dictate}
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isListening && 'bg-primary/10 text-primary'
            )}
          >
            <Mic className="size-4" />
          </button>
        )}
        <textarea
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={
            isListening
              ? normalizeTranscript(interimTranscript) || aiMessages.chat.listeningPlaceholder
              : aiMessages.chat.inputPlaceholder
          }
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || chat.isPending}
          aria-label={aiMessages.chat.send}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}
