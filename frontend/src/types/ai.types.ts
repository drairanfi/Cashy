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
