export interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

export interface Sueldo {
  id: string;
  monto: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  montoDestinado: number;
}

export interface Meta {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoMensual: number;
  mesesParaAlcanzar: number | null;
  prioritaria: boolean;
}

export interface DashboardResumen {
  sueldo: number;
  ingresos: number;
  gastos: number;
  ahorros: number;
  saldoDisponible: number;
  totalServicios: number;
  totalMetas: number;
}

export const GASTO_CATEGORIAS = ['Hogar', 'Transporte', 'Ocio', 'Salud', 'Otros'] as const;

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

export interface Comida {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface GimnasioRegistro {
  id: string;
  actividad: string;
  monto: number;
  fecha: string;
}

export interface Ahorro {
  id: string;
  nombre: string;
  objetivo: number;
  actual: number;
}

export type InsightTipo = 'alerta' | 'sugerencia' | 'info';

export interface Insight {
  id: string;
  tipo: InsightTipo;
  titulo: string;
  mensaje: string;
}

export interface InsightsResponse {
  generatedAt: string;
  enabled: boolean;
  insights: Insight[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiAction {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  resumen: string;
}

export interface AiChatResponse {
  reply: string;
  actions: AiAction[];
}

export interface AiActionResult {
  tool: string;
  ok: boolean;
  message: string;
}

export interface AiActionsResponse {
  reply: string;
  results: AiActionResult[];
}
