export const ahorrosMessages = {
  sectionTitle: 'Ahorros',
  addAction: 'Nueva meta',
  totalLabel: (saved: string, target: string) => `${saved} de ${target}`,
  empty: {
    title: 'Todavía no tenés metas de ahorro',
    text: 'Creá una meta y empezá a guardar para lo que más querés.',
    action: 'Crear meta'
  },
  card: {
    completed: 'Completada',
    contribute: 'Aportar',
    delete: 'Eliminar meta',
    of: (target: string) => `de ${target}`
  },
  modal: {
    createTitle: 'Nueva meta de ahorro',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: Viaje a Brasil',
    targetLabel: 'Objetivo',
    savedLabel: 'Ahorrado (opcional)'
  },
  aporte: {
    title: 'Aportar a meta',
    message: (name: string) => `El monto se suma al total ya ahorrado de ${name}.`,
    amountLabel: 'Monto a aportar',
    action: 'Aportar'
  },
  confirmDelete: {
    title: 'Eliminar meta',
    message: (name: string) => `¿Eliminar "${name}"?`
  }
} as const;
