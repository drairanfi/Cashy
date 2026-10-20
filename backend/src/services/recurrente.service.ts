import type { Ocurrencia, ReglaRecurrente } from '@prisma/client';
import { recurrenteRepository } from '../repositories/recurrente.repository.js';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { HttpError } from '../utils/httpError.js';
import { fechasHasta, toUtcMidnight, type Frecuencia } from '../utils/recurrente.js';
import type { CreateRecurrenteInput, UpdateRecurrenteInput } from '../schemas/recurrente.schema.js';

type ReglaConOcurrencias = ReglaRecurrente & { ocurrencias: Ocurrencia[] };

function ocurrenciaDTO(ocurrencia: Ocurrencia) {
  return {
    id: ocurrencia.id,
    reglaId: ocurrencia.reglaId,
    fecha: ocurrencia.fecha.toISOString(),
    estado: ocurrencia.estado,
  };
}

function reglaDTO(regla: ReglaConOcurrencias) {
  const pendientes = regla.ocurrencias.filter((o) => o.estado === 'pendiente');
  return {
    id: regla.id,
    concepto: regla.concepto,
    monto: regla.monto.toNumber(),
    categoria: regla.categoria,
    frecuencia: regla.frecuencia,
    intervalo: regla.intervalo,
    fechaInicio: regla.fechaInicio.toISOString(),
    fechaFin: regla.fechaFin ? regla.fechaFin.toISOString() : null,
    estado: regla.estado,
    proximaOcurrencia: pendientes[0]?.fecha.toISOString() ?? null,
    pendientes: pendientes.length,
  };
}

function parseFecha(value: string): Date {
  const fecha = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime())) {
    throw new HttpError(400, 'Fecha inválida');
  }
  return fecha;
}

export async function listRecurrentesUseCase(usuarioId: string) {
  const reglas = await recurrenteRepository.findByUsuario(usuarioId);
  return reglas.map(reglaDTO);
}

export async function createRecurrenteUseCase(usuarioId: string, data: CreateRecurrenteInput) {
  const fechaInicio = parseFecha(data.fechaInicio);
  const fechaFin = data.fechaFin ? parseFecha(data.fechaFin) : null;

  const hoy = toUtcMidnight(new Date());
  const fechas = fechasHasta(
    fechaInicio,
    data.frecuencia,
    data.intervalo,
    hoy,
    data.fechaFin ?? null,
  );

  const regla = await recurrenteRepository.createWithOcurrencias(
    usuarioId,
    {
      concepto: data.concepto,
      monto: data.monto,
      categoria: data.categoria ?? null,
      frecuencia: data.frecuencia,
      intervalo: data.intervalo,
      fechaInicio,
      fechaFin,
    },
    fechas,
  );

  return {
    ...reglaDTO(regla),
    ocurrencias: regla.ocurrencias.map(ocurrenciaDTO),
  };
}

export async function updateRecurrenteUseCase(
  usuarioId: string,
  id: string,
  data: UpdateRecurrenteInput,
) {
  const regla = await recurrenteRepository.findById(id);
  if (!regla || regla.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Regla no encontrada');
  }

  if (data.estado) {
    await recurrenteRepository.updateEstado(id, data.estado);
  }

  const actualizada = await recurrenteRepository.findById(id);
  if (!actualizada) {
    throw new HttpError(404, 'Regla no encontrada');
  }

  return reglaDTO(actualizada);
}

export async function deleteRecurrenteUseCase(usuarioId: string, id: string) {
  const regla = await recurrenteRepository.findById(id);
  if (!regla || regla.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Regla no encontrada');
  }

  return recurrenteRepository.remove(id);
}

export async function listPendientesUseCase(usuarioId: string) {
  const hoy = toUtcMidnight(new Date());
  const activas = await recurrenteRepository.findActivasByUsuario(usuarioId);

  for (const regla of activas) {
    const fin = regla.fechaFin ? regla.fechaFin.toISOString().slice(0, 10) : null;
    const fechas = fechasHasta(
      regla.fechaInicio,
      regla.frecuencia as Frecuencia,
      regla.intervalo,
      hoy,
      fin,
    );
    if (fechas.length > 0) {
      await recurrenteRepository.createOcurrencias(regla.id, fechas);
    }
  }

  const pendientes = await recurrenteRepository.findOcurrenciasPendientes(usuarioId);
  return pendientes.map((ocurrencia) => ({
    id: ocurrencia.id,
    reglaId: ocurrencia.reglaId,
    fecha: ocurrencia.fecha.toISOString(),
    concepto: ocurrencia.regla.concepto,
    monto: ocurrencia.regla.monto.toNumber(),
    categoria: ocurrencia.regla.categoria,
    estado: ocurrencia.estado,
  }));
}

export async function confirmarOcurrenciaUseCase(usuarioId: string, id: string) {
  const ocurrencia = await recurrenteRepository.findOcurrenciaById(id);
  if (!ocurrencia || ocurrencia.regla.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Ocurrencia no encontrada');
  }
  if (ocurrencia.estado !== 'pendiente') {
    throw new HttpError(409, 'La ocurrencia ya fue procesada');
  }

  const actualizada = await recurrenteRepository.updateOcurrenciaEstado(id, 'confirmada');
  const gasto = await gastoRepository.create(usuarioId, {
    descripcion: ocurrencia.regla.concepto,
    monto: ocurrencia.regla.monto.toNumber(),
    categoria: ocurrencia.regla.categoria ?? 'Otros',
  });

  return {
    gasto: {
      id: gasto.id,
      descripcion: gasto.descripcion,
      monto: gasto.monto.toNumber(),
      categoria: gasto.categoria,
      fecha: gasto.fecha.toISOString(),
    },
    ocurrencia: ocurrenciaDTO(actualizada),
  };
}

export async function omitirOcurrenciaUseCase(usuarioId: string, id: string) {
  const ocurrencia = await recurrenteRepository.findOcurrenciaById(id);
  if (!ocurrencia || ocurrencia.regla.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Ocurrencia no encontrada');
  }
  if (ocurrencia.estado !== 'pendiente') {
    throw new HttpError(409, 'La ocurrencia ya fue procesada');
  }

  const actualizada = await recurrenteRepository.updateOcurrenciaEstado(id, 'omitida');
  return ocurrenciaDTO(actualizada);
}
