import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { formatMoney } from '../utils/money.js';
import { GASTO_CATEGORIAS } from '../schemas/gasto.schema.js';
import { userRepository } from '../repositories/user.repository.js';
import { sueldoRepository } from '../repositories/sueldo.repository.js';
import { servicioRepository } from '../repositories/servicio.repository.js';
import { metaRepository } from '../repositories/meta.repository.js';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { comidaRepository } from '../repositories/comida.repository.js';
import { gimnasioRepository } from '../repositories/gimnasio.repository.js';
import { ahorroRepository } from '../repositories/ahorro.repository.js';
import { categoriaRepository } from '../repositories/categoria.repository.js';
import { insightsModelSchema, type ChatInput, type Insight } from '../schemas/ai.schema.js';
import {
  buildToolDefinitions,
  buildProposedAction,
  executeAction,
  type ActionInput,
  type ActionResult,
  type ProposedAction,
} from './ai-tools.js';

const REQUEST_TIMEOUT_MS = 60_000;
const INSIGHTS_TTL_MS = 60 * 60 * 1000;
const MAX_ACTIONS_PER_TURN = 5;

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface RawToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ChatResponse {
  reply: string;
  actions: ProposedAction[];
}

export interface RunActionsResponse {
  reply: string;
  results: ActionResult[];
}

export interface InsightsResponse {
  generatedAt: string;
  enabled: boolean;
  insights: Insight[];
}

const insightsCache = new Map<string, { data: InsightsResponse; expiresAt: number }>();

export function isAiEnabled(): boolean {
  return Boolean(env.OPENCODE_API_KEY);
}

function ensureAiEnabled() {
  if (!env.OPENCODE_API_KEY) {
    throw new HttpError(503, 'El asistente IA no está configurado');
  }
}

interface ModelOptions {
  maxTokens?: number;
  temperature?: number;
  tools?: unknown[];
}

async function callModelMessage(
  usuarioId: string,
  messages: ChatCompletionMessage[],
  options: ModelOptions = {},
): Promise<{ content: string; toolCalls: RawToolCall[] }> {
  ensureAiEnabled();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${env.OPENCODE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENCODE_API_KEY}`,
        'x-opencode-session': `cashy-${usuarioId}`,
        'User-Agent': 'cashy/1.0',
      },
      body: JSON.stringify({
        model: env.OPENCODE_MODEL,
        messages,
        max_tokens: options.maxTokens ?? 1200,
        temperature: options.temperature ?? 0.4,
        ...(options.tools ? { tools: options.tools, tool_choice: 'auto' } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('OpenCode API error', res.status, detail);
      throw new HttpError(502, 'El asistente IA no está disponible en este momento');
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string; tool_calls?: RawToolCall[] } }>;
    };
    const message = data.choices?.[0]?.message;

    return {
      content: message?.content?.trim() ?? '',
      toolCalls: message?.tool_calls ?? [],
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new HttpError(504, 'El asistente IA tardó demasiado en responder');
    }
    console.error('OpenCode request failed', err);
    throw new HttpError(502, 'No se pudo contactar al asistente IA');
  } finally {
    clearTimeout(timeout);
  }
}

async function callModel(
  usuarioId: string,
  messages: ChatCompletionMessage[],
  options: ModelOptions = {},
): Promise<string> {
  const { content } = await callModelMessage(usuarioId, messages, options);

  if (!content) {
    throw new HttpError(502, 'El asistente IA devolvió una respuesta vacía');
  }

  return content;
}

async function buildFinancialContext(usuarioId: string): Promise<string> {
  const [usuario, sueldo, servicios, metas, gastos, comidas, gimnasio, ahorros, categorias] =
    await Promise.all([
      userRepository.findById(usuarioId),
      sueldoRepository.findByUsuario(usuarioId),
      servicioRepository.findByUsuario(usuarioId),
      metaRepository.findByUsuario(usuarioId),
      gastoRepository.findByUsuario(usuarioId),
      comidaRepository.findByUsuario(usuarioId),
      gimnasioRepository.findByUsuario(usuarioId),
      ahorroRepository.findByUsuario(usuarioId),
      categoriaRepository.findByUsuario(usuarioId),
    ]);

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diaActual = hoy.getDate();
  const diasRestantes = Math.max(diasDelMes - diaActual + 1, 0);

  const sueldoMonto = sueldo?.monto.toNumber() ?? 0;
  const totalServicios = servicios.reduce((acc, s) => acc + s.montoDestinado.toNumber(), 0);
  const totalMetas = metas.reduce((acc, m) => acc + m.montoMensual.toNumber(), 0);
  const totalAhorros = ahorros.reduce((acc, a) => acc + a.actual.toNumber(), 0);

  const gastosMes = gastos.filter((g) => g.fecha >= inicioMes);
  const comidasMes = comidas.filter((c) => c.fecha >= inicioMes);
  const gimnasioMes = gimnasio.filter((r) => r.fecha >= inicioMes);

  const totalGastosMes = gastosMes.reduce((acc, g) => acc + g.monto.toNumber(), 0);
  const totalComidasMes = comidasMes.reduce((acc, c) => acc + c.monto.toNumber(), 0);
  const totalGimnasioMes = gimnasioMes.reduce((acc, r) => acc + r.monto.toNumber(), 0);
  const variablesMes = totalGastosMes + totalComidasMes + totalGimnasioMes;

  const gastosTotales = totalServicios + variablesMes;
  const ahorrosTotales = totalMetas + totalAhorros;
  const saldoTrasVariables = sueldoMonto - gastosTotales - ahorrosTotales;
  const porDia = diasRestantes > 0 ? saldoTrasVariables / diasRestantes : saldoTrasVariables;

  const detalleGastos = gastosMes
    .slice(0, 20)
    .map((g) => `${g.descripcion} [${g.categoria}] ${formatMoney(g.monto.toNumber())}`)
    .join(', ');
  const detalleComidas = comidasMes
    .slice(0, 20)
    .map((c) => `${c.descripcion} ${formatMoney(c.monto.toNumber())}`)
    .join(', ');
  const detalleGimnasio = gimnasioMes
    .slice(0, 20)
    .map((r) => `${r.actividad} ${formatMoney(r.monto.toNumber())}`)
    .join(', ');

  const lineas = [
    `Fecha de hoy: ${hoy.toISOString().slice(0, 10)} (día ${diaActual} de ${diasDelMes}, quedan ${diasRestantes} días del mes).`,
    `Nombre del usuario: ${usuario?.nombre ?? 'Usuario'}.`,
    'Todos los montos están en pesos colombianos (COP).',
    `Categorías de gasto disponibles: ${[...GASTO_CATEGORIAS, ...categorias.map((c) => c.nombre)].join(', ')}.`,
    '',
    'INGRESOS',
    `Sueldo mensual: ${formatMoney(sueldoMonto)}.`,
    '',
    'GASTOS FIJOS COMPROMETIDOS',
    `Servicios y obligaciones: ${formatMoney(totalServicios)}.`,
    servicios.length
      ? `Detalle servicios: ${servicios
          .map((s) => `${s.nombre} (${formatMoney(s.montoDestinado.toNumber())})`)
          .join(', ')}.`
      : 'No tiene servicios cargados.',
    '',
    'GASTOS VARIABLES DE ESTE MES',
    `Gastos: total ${formatMoney(totalGastosMes)} en ${gastosMes.length} movimientos. ${detalleGastos ? `Detalle: ${detalleGastos}.` : ''}`,
    `Comida: total ${formatMoney(totalComidasMes)} en ${comidasMes.length} movimientos. ${detalleComidas ? `Detalle: ${detalleComidas}.` : ''}`,
    `Gimnasio: total ${formatMoney(totalGimnasioMes)} en ${gimnasioMes.length} movimientos. ${detalleGimnasio ? `Detalle: ${detalleGimnasio}.` : ''}`,
    `Total de gastos variables de este mes: ${formatMoney(variablesMes)}.`,
    `Gasto total del mes (servicios + variables): ${formatMoney(gastosTotales)}.`,
    '',
    'AHORROS',
    `Aporte mensual comprometido en metas: ${formatMoney(totalMetas)}.`,
    metas.length
      ? `Metas de ahorro: ${metas
          .map(
            (m) =>
              `${m.prioritaria ? 'META GRANDE (prioritaria) - ' : ''}${m.nombre} (objetivo ${formatMoney(m.montoObjetivo.toNumber())}, aporte mensual ${formatMoney(m.montoMensual.toNumber())})`,
          )
          .join(', ')}.`
      : 'No tiene metas de ahorro cargadas.',
    `Dinero ya ahorrado (suma de lo aportado a cada ahorro): ${formatMoney(totalAhorros)}.`,
    ahorros.length
      ? `Ahorros en curso: ${ahorros
          .map(
            (a) =>
              `${a.nombre} (${formatMoney(a.actual.toNumber())} de ${formatMoney(a.objetivo.toNumber())}, ${Math.round((a.actual.toNumber() / a.objetivo.toNumber()) * 100)}%)`,
          )
          .join(', ')}.`
      : 'No tiene ahorros en curso.',
    '',
    'RESULTADO',
    `Gastos totales (servicios + gastos + comida + gimnasio): ${formatMoney(gastosTotales)}.`,
    `Ahorros totales (aporte mensual de metas + dinero ya ahorrado): ${formatMoney(ahorrosTotales)}.`,
    `Saldo disponible = sueldo - gastos totales - ahorros totales = ${formatMoney(saldoTrasVariables)}.`,
    'Usá SIEMPRE este saldo disponible como referencia principal; es el mismo número que muestra el Dashboard.',
    diasRestantes > 0
      ? `Presupuesto diario sugerido para lo que resta del mes: ${formatMoney(porDia)}.`
      : 'El mes ya terminó.',
  ];

  return lineas.join('\n');
}

const SYSTEM_INSIGHTS = `Sos Cashy, un asistente financiero personal que habla en español neutro, cercano y claro (tuteo: "puedes", "tienes", "fíjate").

Recibís el contexto financiero actual del usuario y tenés que devolver SOLO un objeto JSON válido, sin texto extra ni markdown, con esta forma exacta:
{"insights":[{"tipo":"alerta|sugerencia|info","titulo":"...","mensaje":"..."}]}

Reglas:
- Entre 2 y 5 insights.
- Tenés acceso a sueldo, servicios, metas, gastos variables, comida, gimnasio y ahorros; usá el detalle del mes actual.
- Los montos están en pesos colombianos (COP), nunca en dólares.
- Algunas metas pueden estar marcadas como "META GRANDE (prioritaria)" (una casa, un auto, una moto, un viaje importante). Son el objetivo de ahorro más importante del usuario: dalas prioridad en tus consejos y mencionalas por su nombre.
- Cuando hables del saldo disponible, usá exactamente el que figura en 'RESULTADO' (sueldo menos gastos totales menos ahorros totales), que es el mismo que muestra el Dashboard. No calcules el saldo restando solo algunos conceptos.
- "alerta" para riesgos (saldo muy bajo, compromisos altos, mes con poco margen).
- "sugerencia" para ideas concretas de recorte o ahorro (podés nombrar categorías o movimientos reales).
- "info" para datos útiles y neutros.
- Usá los montos reales del contexto. No inventes datos ni categorías que no estén.
- Los mensajes son breves (máximo 2 oraciones), concretos y accionables.
- No repitas el mismo enfoque en dos insights.`;

const SYSTEM_CHAT = `Sos Cashy, el asistente financiero personal del usuario. Respondés en español neutro, cercano y claro (tuteo: "puedes", "tienes", "fíjate"), en texto plano, sin markdown.

Reglas:
- Tenés acceso a TODOS los datos del usuario: sueldo, servicios, metas de ahorro, gastos variables, comida, gimnasio y ahorros. Usá el contexto completo, incluido el detalle del mes actual.
- Los montos están en pesos colombianos (COP), nunca en dólares. No uses la palabra "dólares".
- Algunas metas pueden estar marcadas como "META GRANDE (prioritaria)" (una casa, un auto, una moto, un viaje importante). Esa es la meta de ahorro más importante del usuario: dalas prioridad, mencionálas por su nombre y orientá tus recomendaciones a acercarlo a esa meta.
- Cuando hables del saldo disponible, usá exactamente el que figura en la línea 'Saldo disponible = ...' de la sección RESULTADO (sueldo menos gastos totales menos ahorros totales), que es el mismo número que muestra el Dashboard. No calcules el saldo restando solo algunos conceptos.
- Basate únicamente en el contexto financiero provisto. Si falta un dato, decilo con honestidad en vez de inventarlo.
- Sos claro, cálido y breve: máximo 4 oraciones salvo que pidan detalle.
- Podés hacer cuentas con los montos del contexto (porcentajes, saldo diario, días restantes, totales por categoría).
- Si te preguntan algo ajeno a las finanzas del usuario, aclaralo amablemente y volvé al tema.
- No des consejos de inversión riesgosos ni prometas rendimientos.

Acciones:
- Tenés herramientas para AGREGAR y BORRAR gastos, comidas, gastos de gimnasio y ahorros (incluido aportar a un ahorro).
- Cuando el usuario pida agregar, aportar, crear o borrar algo, SIEMPRE llamá a la herramienta correspondiente en este mismo turno. No pidas confirmación con texto ni digas que ya lo hiciste: el usuario confirma después desde la interfaz.
- Si falta un dato obligatorio pero es inferible, inferilo (por ejemplo, actividad = "gimnasio"). Si no es inferible, pedilo con texto.
- Si el usuario no pide modificar datos, respondé normalmente sin llamar herramientas.`;

function parseInsights(raw: string): Insight[] {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    console.error('Respuesta de insights sin JSON', raw);
    return [];
  }

  try {
    const parsed = insightsModelSchema.parse(JSON.parse(cleaned.slice(start, end + 1)));
    return parsed.insights.map((item) => ({ id: randomUUID(), ...item }));
  } catch (err) {
    console.error('No se pudieron parsear los insights de la IA', err);
    return [];
  }
}

export async function generateInsights(usuarioId: string, force = false): Promise<InsightsResponse> {
  if (!isAiEnabled()) {
    return { generatedAt: new Date().toISOString(), enabled: false, insights: [] };
  }

  const cached = insightsCache.get(usuarioId);
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const contexto = await buildFinancialContext(usuarioId);
  const raw = await callModel(
    usuarioId,
    [
      { role: 'system', content: SYSTEM_INSIGHTS },
      { role: 'user', content: `Contexto financiero del usuario:\n${contexto}` },
    ],
    { maxTokens: 3000, temperature: 0.5 },
  );

  const data: InsightsResponse = {
    generatedAt: new Date().toISOString(),
    enabled: true,
    insights: parseInsights(raw),
  };

  insightsCache.set(usuarioId, { data, expiresAt: Date.now() + INSIGHTS_TTL_MS });
  return data;
}

export async function chat(usuarioId: string, input: ChatInput): Promise<ChatResponse> {
  ensureAiEnabled();

  const [contexto, categorias] = await Promise.all([
    buildFinancialContext(usuarioId),
    categoriaRepository.findByUsuario(usuarioId),
  ]);
  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: `${SYSTEM_CHAT}\n\nContexto financiero actual del usuario:\n${contexto}` },
    ...input.messages,
  ];

  const { content, toolCalls } = await callModelMessage(usuarioId, messages, {
    maxTokens: 2500,
    temperature: 0.5,
    tools: buildToolDefinitions(categorias.map((c) => c.nombre)),
  });

  const actions = toolCalls
    .slice(0, MAX_ACTIONS_PER_TURN)
    .map(buildProposedAction)
    .filter((action): action is ProposedAction => action !== null);

  const reply = content || (actions.length > 0 ? '' : 'No entendí el pedido. ¿Me lo podés repetir?');

  return { reply, actions };
}

export async function runActions(
  usuarioId: string,
  actions: ActionInput[],
): Promise<RunActionsResponse> {
  ensureAiEnabled();

  const results: ActionResult[] = [];
  for (const action of actions.slice(0, MAX_ACTIONS_PER_TURN)) {
    results.push(await executeAction(usuarioId, action));
  }

  const allOk = results.every((result) => result.ok);
  const reply = allOk
    ? `Listo. ${results.map((result) => result.message).join(' ')}`
    : results.map((result) => (result.ok ? result.message : `No pude: ${result.message}`)).join('\n');

  return { reply, results };
}
