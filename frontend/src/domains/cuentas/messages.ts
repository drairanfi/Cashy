export const cuentasMessages = {
  sectionTitle: 'Cuentas',
  subtitle: 'Tus cuentas y billeteras',
  addAction: 'Agregar cuenta',
  totalLabel: (amount: string) => `Balance total: ${amount}`,
  type: {
    efectivo: 'Efectivo',
    banco: 'Banco',
    ahorros: 'Ahorros',
    billetera: 'Billetera',
    tarjeta: 'Tarjeta',
    otro: 'Otro'
  },
  empty: {
    title: 'Todavía no cargaste cuentas',
    text: 'Agregá tus cuentas para saber cuánta plata tenés en cada una.',
    action: 'Agregar cuenta'
  },
  card: {
    initial: (amount: string) => `Inicial ${amount}`,
    balance: 'Balance',
    edit: 'Editar cuenta',
    delete: 'Eliminar cuenta'
  },
  modal: {
    createTitle: 'Agregar cuenta',
    editTitle: 'Editar cuenta',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ej: Cuenta sueldo',
    typeLabel: 'Tipo',
    initialLabel: 'Saldo inicial'
  },
  selector: {
    label: 'Cuenta',
    none: 'Sin cuenta'
  },
  confirmDelete: {
    title: 'Eliminar cuenta',
    message: (name: string) => `¿Eliminar "${name}"? Los movimientos quedan sin cuenta.`
  }
} as const;
