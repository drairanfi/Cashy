import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El navegador bloqueó el micrófono. Habilitá el permiso y probá de nuevo.';
    case 'no-speech':
      return 'No se escuchó nada. Acercate al micrófono e intentá otra vez.';
    case 'audio-capture':
      return 'No encontramos un micrófono disponible.';
    case 'network':
      return 'El servicio de dictado no respondió. Revisá tu conexión.';
    case 'language-not-supported':
      return 'El idioma de dictado no está disponible en este navegador.';
    case 'aborted':
      return 'Dictado cancelado.';
    default:
      return 'No pudimos tomar tu voz. Probá de nuevo.';
  }
}

interface UseSpeechOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
}

const SPANISH_VARIANT_BONUS: Array<{ prefix: string; score: number }> = [
  { prefix: 'es-co', score: 100 },
  { prefix: 'es-419', score: 85 },
  { prefix: 'es-mx', score: 80 },
  { prefix: 'es-us', score: 80 },
  { prefix: 'es-ve', score: 70 },
  { prefix: 'es-ec', score: 70 },
  { prefix: 'es-pe', score: 70 },
  { prefix: 'es-cl', score: 70 },
  { prefix: 'es-ar', score: 60 },
  { prefix: 'es-es', score: 55 },
];

function scoreVoice(voice: SpeechSynthesisVoice, lang: string): number {
  const voiceLang = voice.lang.toLowerCase().replace('_', '-');
  const target = lang.toLowerCase().replace('_', '-');

  if (voiceLang === target) return 1000;

  const variant = SPANISH_VARIANT_BONUS.find((item) => voiceLang.startsWith(item.prefix));
  if (!variant) return -1;

  let score = variant.score;
  const name = voice.name.toLowerCase();
  if (name.includes('natural') || name.includes('neural')) score += 60;
  if (name.includes('google')) score += 40;
  if (name.includes('online')) score += 20;

  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const voice of voices) {
    const score = scoreVoice(voice, lang);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return best;
}

export function useSpeech({ lang = 'es-CO', onResult }: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const interimRef = useRef('');
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const recognitionSupported = getRecognitionCtor() !== null;
  const synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!synthesisSupported) return;

    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, [synthesisSupported]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const commitInterim = useCallback(() => {
    const pending = interimRef.current.trim();
    if (pending) onResultRef.current?.(pending);
    interimRef.current = '';
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || isListening) return;

    setSpeechError(null);

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setSpeechError('No pudimos acceder al micrófono. Revisá los permisos del navegador.');
        return;
      }
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }

      interimRef.current = interim;
      setInterimTranscript(interim);

      if (final) {
        interimRef.current = '';
        setInterimTranscript('');
        onResultRef.current?.(final.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setSpeechError(speechErrorMessage(event.error));
      interimRef.current = '';
      setInterimTranscript('');
      setIsListening(false);
    };

    recognition.onend = () => {
      commitInterim();
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('No pudimos iniciar el dictado.');
    }
  }, [commitInterim, isListening, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!synthesisSupported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(voices, lang);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? lang;
      utterance.rate = 1.15;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    },
    [lang, synthesisSupported, voices],
  );

  const stopSpeaking = useCallback(() => {
    if (!synthesisSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [synthesisSupported]);

  const clearSpeechError = useCallback(() => setSpeechError(null), []);

  return {
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
  };
}