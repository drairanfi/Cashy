export const gastosMessages = {
  sectionTitle: 'Gastos',
  addAction: 'Agregar gasto',
  totalLabel: (amount: string) => `Total: ${amount}`,
  empty: {
    title: 'Todavía no cargaste gastos',
    text: 'Registrá tu primer gasto para ver cómo se reparte tu plata.',
    action: 'Agregar gasto'
  },
  card: {
    delete: 'Eliminar gasto'
  },
  modal: {
    createTitle: 'Agregar gasto',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Ej: Supermercado',
    amountLabel: 'Monto',
    categoryLabel: 'Categoría'
  },
  confirmDelete: {
    title: 'Eliminar gasto',
    message: (description: string) => `¿Eliminar "${description}"?`
  }
} as const;
