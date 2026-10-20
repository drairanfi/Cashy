export const serviciosMessages = {
  sectionTitle: 'Servicios',
  addAction: 'Agregar servicio',
  empty: {
    title: 'Todavía no cargaste servicios',
    text: 'Sumá tus servicios fijos para calcular tu saldo disponible.',
    action: 'Agregar servicio'
  },
  card: {
    edit: 'Editar'
  },
  modal: {
    createTitle: 'Crear servicio',
    editTitle: 'Editar servicio',
    nameLabel: 'Nombre',
    namePlaceholder: 'Gym',
    amountLabel: 'Monto destinado',
    deleteAction: 'Eliminar servicio'
  },
  confirmDelete: {
    title: 'Eliminar servicio',
    message: (name: string) => `¿Estás seguro de eliminar "${name}"?`
  }
} as const;
