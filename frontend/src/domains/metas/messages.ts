export const metasMessages = {
  sectionTitle: 'Metas de ahorro',
  addAction: 'Agregar meta',
  empty: {
    title: 'Todavía no tenés metas',
    text: 'Definí tus metas de ahorro y seguí cuánto te falta.',
    action: 'Agregar meta'
  },
  card: {
    bigBadge: 'Meta grande',
    edit: 'Editar',
    perMonth: (amount: string) => `${amount}/mes`,
    monthsToReach: (months: number) => `${months} meses para alcanzarla`
  },
  modal: {
    createTitle: 'Crear meta',
    editTitle: 'Editar meta',
    nameLabel: 'Nombre',
    namePlaceholder: 'Viaje a Europa',
    targetLabel: 'Monto objetivo',
    monthlyLabel: 'Monto mensual',
    priorityTitle: 'Esta es mi meta grande',
    priorityHint:
      'Casa, auto, moto, viaje importante... Cashy le dará prioridad en sus consejos.',
    deleteAction: 'Eliminar meta'
  },
  confirmDelete: {
    title: 'Eliminar meta',
    message: (name: string) => `¿Estás seguro de eliminar "${name}"?`
  }
} as const;
