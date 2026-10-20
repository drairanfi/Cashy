export const comidasMessages = {
  sectionTitle: 'Comida',
  addAction: 'Agregar comida',
  totalLabel: (amount: string) => `Total: ${amount}`,
  empty: {
    title: 'Todavía no cargaste comidas',
    text: 'Anotá tus gastos de comida para tener el total del mes a mano.',
    action: 'Agregar comida'
  },
  card: {
    badge: 'Alimentación',
    delete: 'Eliminar comida'
  },
  modal: {
    createTitle: 'Agregar comida',
    descriptionLabel: 'Comida',
    descriptionPlaceholder: 'Ej: Almuerzo',
    amountLabel: 'Monto'
  },
  confirmDelete: {
    title: 'Eliminar comida',
    message: (description: string) => `¿Eliminar "${description}"?`
  }
} as const;
