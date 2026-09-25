import { useEffect, useRef, useState } from 'react';
import { useChat, useConfirmActions } from '../../../hooks/useChat';
import { useAiStatus } from '../../../hooks/useInsights';
import { useSpeech } from '../../../hooks/useSpeech';
import { normalizeTranscript, stripWakeWord } from '../../../utils/speech';
import { Button } from '../../atoms/Button';
import type { AiAction, AiChatMessage } from '../../../types';

interface ChatItem {
  key: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AiAction[];
  status?: 'pending' | 'executing' | 'done' | 'cancelled';
}

const uid = () => crypto.randomUUID();

function toApiMessages(items: ChatItem[]): AiChatMessage[] {
  return items
    .filter((item) => item.content.trim().length > 0)
    .filter((item) => !(item.actions && item.status === 'cancelled'))
    .map((item) => ({ role: item.role, content: item.content }));
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
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
    stopSpeaking,
  } = useSpeech({
    onResult: (transcript) => {
      const content = stripWakeWord(normalizeTranscript(transcript));
      if (!content) return;
      setInput((prev) => (prev ? `${prev} ${content}` : content));
    },
  });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, chat.isPending, confirm.isPending, open]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || chat.isPending) return;

    const next: ChatItem[] = [...items, { key: uid(), role: 'user', content }];
    setItems(next);
    setInput('');
    setError(null);
    clearSpeechError();

    chat.mutate(toApiMessages(next), {
      onSuccess: (data) => {
        const additions: ChatItem[] = [];
        if (data.reply) {
          additions.push({ key: uid(), role: 'assistant', content: data.reply });
        }
        if (data.actions.length > 0) {
          additions.push({
            key: uid(),
            role: 'assistant',
            content: data.actions.map((action) => action.resumen).join('\n'),
            actions: data.actions,
            status: 'pending',
          });
        }
        setItems((prev) => [...prev, ...additions]);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos responder. Probá de nuevo.');
      },
    });
  };

  const handleConfirm = (itemKey: string, actions: AiAction[]) => {
    setItems((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, status: 'executing' } : item)),
    );
    setError(null);

    confirm.mutate(actions, {
      onSuccess: (data) => {
        setItems((prev) => [
          ...prev.map((item) =>
            item.key === itemKey ? { ...item, status: 'done' as const } : item,
          ),
          { key: uid(), role: 'assistant', content: data.reply },
        ]);
      },
      onError: (err) => {
        setItems((prev) =>
          prev.map((item) => (item.key === itemKey ? { ...item, status: 'pending' } : item)),
        );
        setError(err instanceof Error ? err.message : 'No pudimos ejecutar la acción.');
      },
    });
  };

  const handleCancel = (itemKey: string) => {
    setItems((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, status: 'cancelled' } : item)),
    );
  };

  if (aiStatus && !aiStatus.enabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Abrir el asistente Cashy"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <section className="chat-panel" aria-label="Asistente Cashy">
      <div className="chat-panel__header">
        <div>
          <p className="chat-panel__title">Cashy</p>
          <p className="chat-panel__subtitle">Tu asistente financiero</p>
        </div>
        <button
          type="button"
          className="chat-panel__close"
          onClick={() => setOpen(false)}
          aria-label="Cerrar el asistente"
        >
          ×
        </button>
      </div>

      <div className="chat-panel__messages">
        {items.length === 0 && (
          <p className="chat-panel__empty">
            Preguntame lo que quieras sobre tus finanzas, o pedime que agregue o borre algo: "agrega
            300.000 al gimnasio".
          </p>
        )}

        {items.map((item) => {
          if (item.actions) {
            return (
              <div key={item.key} className="chat-actions">
                <p className="chat-actions__title">Cashy propone</p>
                <ul className="chat-actions__list">
                  {item.actions.map((action) => (
                    <li key={action.id} className="chat-actions__item">
                      <span className="chat-actions__bullet" />
                      <span>{action.resumen}</span>
                    </li>
                  ))}
                </ul>

                {item.status === 'pending' && (
                  <div className="chat-actions__buttons">
                    <Button variant="ghost" onClick={() => handleCancel(item.key)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleConfirm(item.key, item.actions!)}>Confirmar</Button>
                  </div>
                )}
                {item.status === 'executing' && (
                  <p className="chat-actions__status">Ejecutando...</p>
                )}
                {item.status === 'done' && <p className="chat-actions__status">Hecho</p>}
                {item.status === 'cancelled' && <p className="chat-actions__status">Cancelado</p>}
              </div>
            );
          }

          return (
            <div
              key={item.key}
              className={`chat-msg chat-msg--${item.role === 'user' ? 'user' : 'assistant'}`}
            >
              <p className="chat-msg__body">{item.content}</p>
              {item.role === 'assistant' && synthesisSupported && (
                <button
                  type="button"
                  className="chat-msg__speak"
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(item.content))}
                  aria-label="Leer en voz alta"
                >
                  <SpeakerIcon />
                  <span>{isSpeaking ? 'Detener' : 'Escuchar'}</span>
                </button>
              )}
            </div>
          );
        })}

        {chat.isPending && <p className="chat-msg chat-msg--assistant">Pensando...</p>}
        {(speechError || error) && <p className="chat-panel__status">{speechError ?? error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        className="chat-panel__form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        {recognitionSupported && (
          <button
            type="button"
            className={`chat-panel__mic ${isListening ? 'chat-panel__mic--active' : ''}`}
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                void startListening();
              }
            }}
            aria-label={isListening ? 'Detener dictado' : 'Dictar'}
          >
            <MicIcon />
          </button>
        )}
        <textarea
          className="input chat-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={
            isListening
              ? normalizeTranscript(interimTranscript) || 'Escuchando...'
              : 'Escribí tu pregunta'
          }
        />
        <button
          type="submit"
          className="chat-panel__send"
          disabled={!input.trim() || chat.isPending}
          aria-label="Enviar"
        >
          <SendIcon />
        </button>
      </form>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 19v3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
