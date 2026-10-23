export const dashboardMessages = {
  greeting: 'Hola,',
  saldoLabel: 'Saldo disponible',
  saldoCurrency: 'Pesos colombianos (COP)',
  saldoPercentage: (percentage: number) => `${percentage}% del sueldo`,
  cuentaPercentage: (percentage: number) => `${percentage}% de lo asignado`,
  dinero: {
    total: 'Total'
  },
  stats: {
    income: 'Ingresos',
    expenses: 'Gastos',
    savings: 'Ahorros'
  },
  notifications: {
    label: 'Notificaciones'
  },
  quickRegister: {
    title: 'Registro rápido',
    action: 'Registrar',
    feedback: {
      gasto: 'Gasto registrado',
      comida: 'Comida registrada',
      gimnasio: 'Actividad registrada'
    }
  },
  recentMovements: {
    title: 'Últimos movimientos',
    empty: {
      title: 'Todavía no cargaste movimientos',
      text: 'Registrá un gasto, una comida o una actividad para verlos acá.'
    },
    types: {
      gasto: 'Gasto',
      comida: 'Comida',
      gimnasio: 'Gimnasio'
    }
  }
} as const;
