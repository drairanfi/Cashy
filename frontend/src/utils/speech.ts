const SPLIT_VARIANTS = /\bcash\s*(?:y|i)\b/gi;
const WORD_VARIANTS =
  /\b(cashy|cashi|cachy|kachy|cachi|casy|kasy|kashi|kasi|casey|kacey|cashe|kase|catchy|katchy|cash)\b/gi;
const VOCATIVE_AMBIGUOUS = /\b(hola|oye|hey|che|ey|dale)\s+(casi|cache|cach[eé]|cashi)\b/gi;
const START_AMBIGUOUS = /^(casi|cache|cach[eé])\b/i;

export function normalizeTranscript(text: string): string {
  return text
    .replace(SPLIT_VARIANTS, 'Cashy')
    .replace(WORD_VARIANTS, 'Cashy')
    .replace(VOCATIVE_AMBIGUOUS, (_match, vocative: string) => `${vocative} Cashy`)
    .replace(START_AMBIGUOUS, 'Cashy');
}

export function stripWakeWord(text: string): string {
  return text.replace(/^cashy[\s,.:;!?-]*/i, '').trim();
}
