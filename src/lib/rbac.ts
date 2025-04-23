export type Role = 'ADMIN' | 'USER' | 'GUEST';

export type Permission =
  | 'CREATE_POST'
  | 'EDIT_POST'
  | 'DELETE_POST'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_USERS';

// Define role-based permissions
const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ['CREATE_POST', 'EDIT_POST', 'DELETE_POST', 'VIEW_ANALYTICS', 'MANAGE_USERS'],
  USER: ['CREATE_POST', 'EDIT_POST', 'DELETE_POST'],
  GUEST: [],
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}