export const gimnasioMessages = {
  sectionTitle: 'Gimnasio',
  addAction: 'Agregar actividad',
  totalLabel: (amount: string) => `Total: ${amount}`,
  empty: {
    title: 'Todavía no cargaste actividades',
    text: 'Sumá tus entrenamientos y lo que gastás en el gym.',
    action: 'Agregar actividad'
  },
  card: {
    badge: 'Entrenamiento',
    delete: 'Eliminar actividad'
  },
  modal: {
    createTitle: 'Agregar actividad',
    activityLabel: 'Actividad',
    activityPlaceholder: 'Ej: Pesas',
    amountLabel: 'Monto'
  },
  confirmDelete: {
    title: 'Eliminar actividad',
    message: (activity: string) => `¿Eliminar "${activity}"?`
  }
} as const;
