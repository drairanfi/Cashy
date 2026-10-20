export const dashboardMessages = {
  greeting: 'Hola,',
  saldoLabel: 'Saldo disponible',
  saldoCurrency: 'Pesos colombianos (COP)',
  saldoPercentage: (percentage: number) => `${percentage}% del sueldo`,
  stats: {
    income: 'Ingresos',
    expenses: 'Gastos',
    savings: 'Ahorros'
  }
} as const;
