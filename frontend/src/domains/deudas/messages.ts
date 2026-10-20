export const deudasMessages = {
  sectionTitle: 'Deudas',
  addAction: 'Agregar deuda',
  viewList: 'Mis deudas',
  viewCalendar: 'Calendario',
  totalPendingLabel: (amount: string) => `Pendiente: ${amount}`,
  direction: {
    debida: 'Yo debo',
    'a_cobrar': 'Me deben'
  },
  frequency: {
    semanal: 'Semanal',
    quincenal: 'Quincenal',
    mensual: 'Mensual'
  },
  empty: {
    title: 'Todavía no cargaste deudas',
    text: 'Agregá una deuda y seguí el pago de sus cuotas.',
    action: 'Agregar deuda'
  },
  card: {
    delete: 'Eliminar deuda',
    installments: (paid: number, total: number) => `${paid} de ${total} cuotas`,
    pending: (amount: string) => `Pendiente ${amount}`,
    next: (date: string) => `Próxima ${date}`,
    noNext: 'Sin cuotas pendientes',
    showInstallments: 'Ver cuotas',
    hideInstallments: 'Ocultar cuotas'
  },
  cuota: {
    number: (numero: number) => `Cuota ${numero}`,
    pay: 'Pagar',
    paid: 'Pagada',
    pending: 'Pendiente'
  },
  calendar: {
    emptyTitle: 'No tenés cuotas por pagar',
    emptyText: 'Cuando agregues deudas vas a ver acá tus próximos vencimientos.'
  },
  modal: {
    createTitle: 'Agregar deuda',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: Préstamo del auto',
    directionLabel: 'Dirección',
    amountLabel: 'Monto total',
    installmentsLabel: 'Cantidad de cuotas',
    installmentsPlaceholder: 'Ej: 12',
    frequencyLabel: 'Frecuencia',
    firstDateLabel: 'Primera fecha'
  },
  confirmDelete: {
    title: 'Eliminar deuda',
    message: (name: string) => `¿Eliminar "${name}"? También se borran sus cuotas.`
  }
} as const;
