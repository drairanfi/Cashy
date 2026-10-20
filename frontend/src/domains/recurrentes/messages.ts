export const recurrentesMessages = {
  sectionTitle: 'Recurrentes',
  subtitle: 'Gastos que se repiten en el tiempo',
  listTitle: 'Mis recurrentes',
  addAction: 'Agregar recurrente',
  frequency: {
    diaria: 'Diaria',
    semanal: 'Semanal',
    mensual: 'Mensual',
    anual: 'Anual'
  },
  estado: {
    activa: 'Activa',
    pausada: 'Pausada'
  },
  intervalBadge: (label: string, intervalo: number) =>
    intervalo > 1 ? `${label} x${intervalo}` : label,
  empty: {
    title: 'Todavía no cargaste recurrentes',
    text: 'Agregá un gasto recurrente y confirmá sus ocurrencias cuando lleguen.',
    action: 'Agregar recurrente'
  },
  card: {
    category: (name: string) => `Categoría: ${name}`,
    next: (date: string) => `Próxima: ${date}`,
    noNext: 'Sin próximas ocurrencias',
    pending: (count: number) => (count === 1 ? '1 pendiente' : `${count} pendientes`),
    pause: 'Pausar',
    resume: 'Reanudar',
    delete: 'Eliminar recurrente'
  },
  pendientes: {
    title: 'Pendientes',
    emptyTitle: 'No tenés ocurrencias pendientes',
    emptyText: 'Acá van a aparecer los recurrentes que tengas que confirmar.',
    confirm: 'Confirmar',
    omit: 'Omitir',
    date: (date: string) => `Vence ${date}`
  },
  modal: {
    createTitle: 'Agregar recurrente',
    conceptLabel: 'Concepto',
    conceptPlaceholder: 'Ej: Alquiler',
    amountLabel: 'Monto',
    categoryLabel: 'Categoría',
    frequencyLabel: 'Frecuencia',
    intervalLabel: 'Cada',
    intervalPlaceholder: '1',
    startDateLabel: 'Fecha de inicio',
    endDateLabel: 'Fecha de fin (opcional)'
  },
  confirmDelete: {
    title: 'Eliminar recurrente',
    message: (name: string) => `¿Eliminar "${name}"? También se borran sus ocurrencias.`
  }
} as const;
