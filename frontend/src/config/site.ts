export const siteConfig = {
  name: 'Cashy',
  description: 'Organizá tus finanzas personales: sueldo, servicios, metas y gastos.'
} as const;

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'
} as const;
