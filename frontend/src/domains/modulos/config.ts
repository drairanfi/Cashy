import {
  CreditCard,
  Dumbbell,
  PiggyBank,
  Repeat,
  Target,
  UtensilsCrossed,
  Wallet,
  type LucideIcon
} from 'lucide-react';

import { commonMessages } from '@/config/messages';
import type { ModuloClave } from '@/types/modulo.types';

export interface ModuloOpcionalDefinition {
  clave: ModuloClave;
  label: string;
  href: string;
  icon: LucideIcon;
  impactoAlOcultar: string;
}

export const MODULOS_OPCIONALES: ModuloOpcionalDefinition[] = [
  {
    clave: 'gastos',
    label: commonMessages.navigation.expenses,
    href: '/gastos',
    icon: Wallet,
    impactoAlOcultar:
      'Los gastos registrados dejan de restar de tu saldo disponible y de tus cuentas.'
  },
  {
    clave: 'comida',
    label: commonMessages.navigation.food,
    href: '/comida',
    icon: UtensilsCrossed,
    impactoAlOcultar:
      'Las comidas registradas dejan de restar de tu saldo disponible y de tus cuentas.'
  },
  {
    clave: 'gimnasio',
    label: commonMessages.navigation.gym,
    href: '/gimnasio',
    icon: Dumbbell,
    impactoAlOcultar:
      'Los gastos de gimnasio dejan de restar de tu saldo disponible y de tus cuentas.'
  },
  {
    clave: 'ahorros',
    label: commonMessages.navigation.savings,
    href: '/ahorros',
    icon: PiggyBank,
    impactoAlOcultar: 'Los montos ahorrados dejan de contar en tu saldo disponible.'
  },
  {
    clave: 'recurrentes',
    label: commonMessages.navigation.recurring,
    href: '/recurrentes',
    icon: Repeat,
    impactoAlOcultar:
      'Los pagos recurrentes que ya se registraron como gastos siguen contando. Solo deja de mostrarse el módulo.'
  },
  {
    clave: 'deudas',
    label: commonMessages.navigation.debts,
    href: '/deudas',
    icon: CreditCard,
    impactoAlOcultar:
      'Las deudas y sus cuotas dejan de mostrarse. No afectan tu saldo disponible.'
  },
  {
    clave: 'metas',
    label: commonMessages.navigation.goals,
    href: '/metas',
    icon: Target,
    impactoAlOcultar:
      'Las metas de ahorro dejan de mostrarse y su aporte mensual deja de restar de tu saldo disponible.'
  }
];
