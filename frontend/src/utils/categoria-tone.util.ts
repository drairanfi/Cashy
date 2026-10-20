import type { BadgeTone } from '@/components/atoms/badge';

const TONES: BadgeTone[] = ['neutral', 'warning', 'success', 'danger'];

export function categoriaTone(nombre: string): BadgeTone {
  let hash = 0;
  for (let index = 0; index < nombre.length; index += 1) {
    hash = (hash * 31 + nombre.charCodeAt(index)) | 0;
  }
  return TONES[Math.abs(hash) % TONES.length];
}
