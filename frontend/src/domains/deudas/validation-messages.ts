export const deudaValidationMessages = {
  nameRequired: 'Ingresá un nombre',
  nameTooLong: 'Máximo 80 caracteres',
  directionRequired: 'Elegí una dirección',
  amountRequired: 'Ingresá un monto',
  amountPositive: 'El monto debe ser mayor a 0',
  installmentsRequired: 'Ingresá la cantidad de cuotas',
  installmentsInteger: 'Debe ser un número entero',
  installmentsMin: 'Mínimo 1 cuota',
  installmentsMax: 'Máximo 120 cuotas',
  frequencyRequired: 'Elegí una frecuencia',
  dateInvalid: 'Formato de fecha inválido (YYYY-MM-DD)'
} as const;
