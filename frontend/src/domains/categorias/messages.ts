export const categoriasMessages = {
  sectionTitle: 'Categorías',
  subtitle: 'Organizá tus gastos por tipo',
  addAction: 'Nueva categoría',
  empty: {
    title: 'Todavía no creaste categorías propias',
    text: 'Armá tus propias categorías para clasificar mejor tus gastos.',
    action: 'Nueva categoría'
  },
  card: {
    edit: 'Editar'
  },
  modal: {
    createTitle: 'Nueva categoría',
    editTitle: 'Editar categoría',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: Mascotas',
    deleteAction: 'Eliminar categoría'
  },
  confirmDelete: {
    title: 'Eliminar categoría',
    message: (name: string) => `¿Eliminar "${name}"?`
  }
} as const;
