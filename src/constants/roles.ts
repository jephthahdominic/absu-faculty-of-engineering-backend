export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DEPARTMENT_ADMIN: 'department_admin',
  STUDENT: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
