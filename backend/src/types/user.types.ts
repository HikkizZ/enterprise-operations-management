
export const userRoles = [
  'SuperAdministrador',
  'Administrador',
  'Usuario',
  'RecursosHumanos',
  'Gerencia',
  'Ventas',
  'Arriendo',
  'Finanzas',
  'Mecánico',
  'Mantenciones de Maquinaria',
] as const;

export type UserRole = (typeof userRoles)[number];