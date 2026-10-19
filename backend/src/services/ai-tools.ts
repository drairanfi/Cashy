import { z } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { formatMoney } from '../utils/money.js';
import { GASTO_CATEGORIAS } from '../schemas/gasto.schema.js';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { comidaRepository } from '../repositories/comida.repository.js';
import { gimnasioRepository } from '../repositories/gimnasio.repository.js';
import { ahorroRepository } from '../repositories/ahorro.repository.js';
import { createGastoUseCase, deleteGastoUseCase } from './gasto.service.js';
import { createComidaUseCase, deleteComidaUseCase } from './comida.service.js';
import { createGimnasioUseCase, deleteGimnasioUseCase } from './gimnasio.service.js';
import { aportarAhorroUseCase, createAhorroUseCase, deleteAhorroUseCase } from './ahorro.service.js';

export const AI_TOOL_NAMES = [
  'crear_gasto',
  'crear_comida',
  'crear_gimnasio',
  'crear_ahorro',
  'aportar_ahorro',
  'borrar_gasto',
  'borrar_comida',
  'borrar_gimnasio',
  'borrar_ahorro',
] as const;

export type AiToolName = (typeof AI_TOOL_NAMES)[number];

export interface ActionInput {
  id: string;
  tool: AiToolName;
  args: Record<string, unknown>;
}

export interface ProposedAction extends ActionInput {
  resumen: string;
}

export interface ActionResult {
  tool: AiToolName;
  ok: boolean;
  message: string;
}

export const AI_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'crear_gasto',
      description: 'Registra un gasto variable del usuario (ej: café, ropa, transporte).',
      parameters: {
        type: 'object',
        properties: {
          descripcion: { type: 'string', description: 'Descripción corta del gasto.' },
          monto: { type: 'number', description: 'Monto en pesos.' },
          categoria: {
            type: 'string',
            enum: [...GASTO_CATEGORIAS],
            description: 'Categoría del gasto.',
          },
        },
        required: ['descripcion', 'monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_comida',
      description: 'Registra un gasto de comida del usuario.',
      parameters: {
        type: 'object',
        properties: {
          descripcion: { type: 'string', description: 'Qué comió o compró.' },
          monto: { type: 'number', description: 'Monto en pesos.' },
        },
        required: ['descripcion', 'monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_gimnasio',
      description: 'Registra un gasto de gimnasio del usuario.',
      parameters: {
        type: 'object',
        properties: {
          actividad: { type: 'string', description: 'Actividad o concepto del gasto.' },
          monto: { type: 'number', description: 'Monto en pesos.' },
        },
        required: ['actividad', 'monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_ahorro',
      description: 'Crea una meta de ahorro del usuario.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre del ahorro.' },
          objetivo: { type: 'number', description: 'Monto objetivo en pesos.' },
          actual: { type: 'number', description: 'Monto ya ahorrado (opcional).' },
        },
        required: ['nombre', 'objetivo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'aportar_ahorro',
      description: 'Suma un aporte a un ahorro existente, buscándolo por nombre.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre del ahorro.' },
          monto: { type: 'number', description: 'Monto a aportar en pesos.' },
        },
        required: ['nombre', 'monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'borrar_gasto',
      description: 'Elimina un gasto variable buscándolo por descripción.',
      parameters: {
        type: 'object',
        properties: { descripcion: { type: 'string', description: 'Descripción del gasto.' } },
        required: ['descripcion'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'borrar_comida',
      description: 'Elimina un registro de comida buscándolo por descripción.',
      parameters: {
        type: 'object',
        properties: { descripcion: { type: 'string', description: 'Descripción de la comida.' } },
        required: ['descripcion'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'borrar_gimnasio',
      description: 'Elimina un gasto de gimnasio buscándolo por actividad.',
      parameters: {
        type: 'object',
        properties: { actividad: { type: 'string', description: 'Actividad del registro.' } },
        required: ['actividad'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'borrar_ahorro',
      description: 'Elimina una meta de ahorro buscándola por nombre.',
      parameters: {
        type: 'object',
        properties: { nombre: { type: 'string', description: 'Nombre del ahorro.' } },
        required: ['nombre'],
      },
    },
  },
];

export function buildToolDefinitions(categorias: string[]) {
  const disponibles = [...GASTO_CATEGORIAS, ...categorias];
  return AI_TOOL_DEFINITIONS.map((tool) => {
    if (tool.function.name !== 'crear_gasto') return tool;
    return {
      ...tool,
      function: {
        ...tool.function,
        parameters: {
          ...tool.function.parameters,
          properties: {
            ...tool.function.parameters.properties,
            categoria: {
              type: 'string',
              enum: disponibles,
              description: 'Categoría del gasto. Usá una de las categorías disponibles del usuario.',
            },
          },
        },
      },
    };
  });
}

const crearGastoArgs = z.object({
  descripcion: z.string().min(2).max(100),
  monto: z.number().positive(),
  categoria: z.string().trim().min(1).max(30).default('Otros'),
});

const crearComidaArgs = z.object({
  descripcion: z.string().min(2).max(100),
  monto: z.number().positive(),
});

const crearGimnasioArgs = z.object({
  actividad: z.string().min(2).max(100),
  monto: z.number().positive(),
});

const crearAhorroArgs = z.object({
  nombre: z.string().min(2).max(100),
  objetivo: z.number().positive(),
  actual: z.number().min(0).default(0),
});

const aportarAhorroArgs = z.object({
  nombre: z.string().min(1).max(100),
  monto: z.number().positive(),
});

const gastoRefArgs = z.object({ descripcion: z.string().min(1).max(100) });
const comidaRefArgs = z.object({ descripcion: z.string().min(1).max(100) });
const gimnasioRefArgs = z.object({ actividad: z.string().min(1).max(100) });
const ahorroRefArgs = z.object({ nombre: z.string().min(1).max(100) });

function isToolName(name: string): name is AiToolName {
  return (AI_TOOL_NAMES as readonly string[]).includes(name);
}

function buildResumen(tool: AiToolName, args: Record<string, unknown>): string | null {
  switch (tool) {
    case 'crear_gasto': {
      const parsed = crearGastoArgs.safeParse(args);
      if (!parsed.success) return null;
      const { descripcion, monto, categoria } = parsed.data;
      return `Agregar el gasto "${descripcion}" por ${formatMoney(monto)} (${categoria})`;
    }
    case 'crear_comida': {
      const parsed = crearComidaArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Agregar la comida "${parsed.data.descripcion}" por ${formatMoney(parsed.data.monto)}`;
    }
    case 'crear_gimnasio': {
      const parsed = crearGimnasioArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Agregar el gasto de gimnasio "${parsed.data.actividad}" por ${formatMoney(parsed.data.monto)}`;
    }
    case 'crear_ahorro': {
      const parsed = crearAhorroArgs.safeParse(args);
      if (!parsed.success) return null;
      const { nombre, objetivo, actual } = parsed.data;
      const extra = actual > 0 ? ` (ya ahorrado ${formatMoney(actual)})` : '';
      return `Crear el ahorro "${nombre}" con objetivo ${formatMoney(objetivo)}${extra}`;
    }
    case 'aportar_ahorro': {
      const parsed = aportarAhorroArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Aportar ${formatMoney(parsed.data.monto)} al ahorro "${parsed.data.nombre}"`;
    }
    case 'borrar_gasto': {
      const parsed = gastoRefArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Borrar el gasto "${parsed.data.descripcion}"`;
    }
    case 'borrar_comida': {
      const parsed = comidaRefArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Borrar la comida "${parsed.data.descripcion}"`;
    }
    case 'borrar_gimnasio': {
      const parsed = gimnasioRefArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Borrar la actividad "${parsed.data.actividad}"`;
    }
    case 'borrar_ahorro': {
      const parsed = ahorroRefArgs.safeParse(args);
      if (!parsed.success) return null;
      return `Borrar el ahorro "${parsed.data.nombre}"`;
    }
    default:
      return null;
  }
}

export function buildProposedAction(call: {
  id: string;
  function: { name: string; arguments: string };
}): ProposedAction | null {
  if (!isToolName(call.function.name)) return null;

  let args: Record<string, unknown>;
  try {
    args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
  } catch {
    return null;
  }

  const resumen = buildResumen(call.function.name, args);
  if (!resumen) return null;

  return { id: call.id, tool: call.function.name, args, resumen };
}

function fail(tool: AiToolName, message: string): ActionResult {
  return { tool, ok: false, message };
}

function describeError(err: unknown): string {
  if (err instanceof HttpError) return err.message;
  if (err instanceof z.ZodError) return 'Los datos de la acción no son válidos.';
  return 'No pude completar la acción.';
}

function resolveUnique<T>(
  items: T[],
  getText: (item: T) => string,
  query: string,
  label: string,
): T | string {
  const needle = query.trim().toLowerCase();
  const matches = items.filter((item) => getText(item).toLowerCase().includes(needle));

  if (matches.length === 0) return `No encontré ${label} que coincida con "${query}".`;
  if (matches.length > 1) {
    const opciones = matches.slice(0, 5).map(getText).join(', ');
    return `Hay varios registros que coinciden con "${query}": ${opciones}. Aclarame cuál.`;
  }

  return matches[0];
}

export async function executeAction(
  usuarioId: string,
  action: ActionInput,
): Promise<ActionResult> {
  try {
    switch (action.tool) {
      case 'crear_gasto': {
        const args = crearGastoArgs.parse(action.args);
        await createGastoUseCase(usuarioId, args);
        return {
          tool: action.tool,
          ok: true,
          message: `Gasto "${args.descripcion}" de ${formatMoney(args.monto)} agregado.`,
        };
      }
      case 'crear_comida': {
        const args = crearComidaArgs.parse(action.args);
        await createComidaUseCase(usuarioId, args);
        return {
          tool: action.tool,
          ok: true,
          message: `Comida "${args.descripcion}" de ${formatMoney(args.monto)} agregada.`,
        };
      }
      case 'crear_gimnasio': {
        const args = crearGimnasioArgs.parse(action.args);
        await createGimnasioUseCase(usuarioId, args);
        return {
          tool: action.tool,
          ok: true,
          message: `Gasto de gimnasio "${args.actividad}" de ${formatMoney(args.monto)} agregado.`,
        };
      }
      case 'crear_ahorro': {
        const args = crearAhorroArgs.parse(action.args);
        await createAhorroUseCase(usuarioId, args);
        return {
          tool: action.tool,
          ok: true,
          message: `Ahorro "${args.nombre}" con objetivo ${formatMoney(args.objetivo)} creado.`,
        };
      }
      case 'aportar_ahorro': {
        const args = aportarAhorroArgs.parse(action.args);
        const ahorros = await ahorroRepository.findByUsuario(usuarioId);
        const match = resolveUnique(ahorros, (a) => a.nombre, args.nombre, 'un ahorro');
        if (typeof match === 'string') return fail(action.tool, match);

        await aportarAhorroUseCase(usuarioId, match.id, { monto: args.monto });
        return {
          tool: action.tool,
          ok: true,
          message: `Aporté ${formatMoney(args.monto)} al ahorro "${match.nombre}".`,
        };
      }
      case 'borrar_gasto': {
        const args = gastoRefArgs.parse(action.args);
        const gastos = await gastoRepository.findByUsuario(usuarioId);
        const match = resolveUnique(gastos, (g) => g.descripcion, args.descripcion, 'un gasto');
        if (typeof match === 'string') return fail(action.tool, match);

        await deleteGastoUseCase(usuarioId, match.id);
        return {
          tool: action.tool,
          ok: true,
          message: `Gasto "${match.descripcion}" eliminado.`,
        };
      }
      case 'borrar_comida': {
        const args = comidaRefArgs.parse(action.args);
        const comidas = await comidaRepository.findByUsuario(usuarioId);
        const match = resolveUnique(comidas, (c) => c.descripcion, args.descripcion, 'una comida');
        if (typeof match === 'string') return fail(action.tool, match);

        await deleteComidaUseCase(usuarioId, match.id);
        return {
          tool: action.tool,
          ok: true,
          message: `Comida "${match.descripcion}" eliminada.`,
        };
      }
      case 'borrar_gimnasio': {
        const args = gimnasioRefArgs.parse(action.args);
        const registros = await gimnasioRepository.findByUsuario(usuarioId);
        const match = resolveUnique(
          registros,
          (r) => r.actividad,
          args.actividad,
          'una actividad',
        );
        if (typeof match === 'string') return fail(action.tool, match);

        await deleteGimnasioUseCase(usuarioId, match.id);
        return {
          tool: action.tool,
          ok: true,
          message: `Actividad "${match.actividad}" eliminada.`,
        };
      }
      case 'borrar_ahorro': {
        const args = ahorroRefArgs.parse(action.args);
        const ahorros = await ahorroRepository.findByUsuario(usuarioId);
        const match = resolveUnique(ahorros, (a) => a.nombre, args.nombre, 'un ahorro');
        if (typeof match === 'string') return fail(action.tool, match);

        await deleteAhorroUseCase(usuarioId, match.id);
        return {
          tool: action.tool,
          ok: true,
          message: `Ahorro "${match.nombre}" eliminado.`,
        };
      }
      default:
        return fail(action.tool, 'Acción no soportada.');
    }
  } catch (err) {
    return fail(action.tool, describeError(err));
  }
}
