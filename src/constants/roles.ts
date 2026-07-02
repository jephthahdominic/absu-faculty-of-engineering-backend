export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DEAN: 'dean',
  DEPARTMENT_ADMIN: 'department_admin',
  STUDENT: 'student',
  LECTURER: 'lecturer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles with super-admin-level privileges (full system access) */
export const SUPER_LEVEL_ROLES = [ROLES.SUPER_ADMIN, ROLES.DEAN] as const;
