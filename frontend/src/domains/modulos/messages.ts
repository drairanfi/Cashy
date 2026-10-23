export const modulosMessages = {
  pageTitle: 'Configuración',
  pageSubtitle: 'Elegí qué secciones aparecen en el menú y de dónde sale tu dinero.',
  tabs: {
    modules: 'Módulos',
    accounts: 'Cuentas'
  },
  sectionTitle: 'Módulos',
  addModule: {
    title: 'Agregar módulo',
    createTitle: 'Nuevo módulo',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: Mascotas'
  },
  validation: {
    nombreMin: 'Mínimo 2 caracteres',
    nombreMax: 'Máximo 40 caracteres'
  },
  optional: {
    active: 'En el menú',
    hidden: 'Oculto'
  },
  custom: {
    empty: 'Todavía no creaste módulos propios.'
  },
  registro: {
    totalLabel: (amount: string) => `Total: ${amount}`,
    empty: {
      title: 'Todavía no registraste gastos',
      text: 'Registrá tu primer gasto de este módulo para ver cuánto va.'
    },
    add: 'Agregar gasto',
    modalTitle: 'Nuevo gasto',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Ej: Comida para Luna',
    amountLabel: 'Monto',
    deleteAction: 'Eliminar gasto',
    confirmDelete: {
      title: 'Eliminar gasto',
      message: (name: string) =>
        `¿Eliminar "${name}"? Se borra para siempre y no se puede recuperar.`
    },
    validation: {
      descripcionMin: 'Mínimo 2 caracteres',
      descripcionMax: 'Máximo 100 caracteres',
      montoRequerido: 'Ingresá un monto',
      montoPositivo: 'Monto mayor a 0'
    }
  },
  detail: {
    back: 'Volver a Configuración',
    visible: 'Visible en el menú',
    hidden: 'Oculto del menú',
    show: 'Mostrar en el menú',
    hide: 'Ocultar del menú'
  },
  actions: {
    open: 'Abrir',
    show: 'Mostrar en el menú',
    hide: 'Ocultar del menú',
    delete: 'Eliminar para siempre'
  },
  confirmHide: {
    title: 'Ocultar del menú',
    confirm: 'Ocultar',
    message: (name: string, impacto: string) =>
      `¿Ocultar "${name}"? ${impacto} Tus registros no se borran y podés volver a mostrarlo cuando quieras.`
  },
  confirmDelete: {
    title: 'Eliminar módulo',
    message: (name: string) =>
      `¿Eliminar "${name}"? Se borran para siempre todos sus registros y no se puede recuperar. El módulo queda oculto.`,
    customMessage: (name: string) =>
      `¿Eliminar "${name}"? El módulo se borra para siempre y no se puede recuperar.`
  }
} as const;
