export enum Role {
  MANAGER = 'MANAGER',
  WAITER = 'WAITER',
  HOST = 'HOST',
  KITCHEN = 'KITCHEN',
  CASHIER = 'CASHIER',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  SUPPORT = 'SUPPORT',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

// Thêm các permisstion khác
export enum Permission {
  CREATE_POST = 'CREATE_POST',
  EDIT_POST = 'EDIT_POST',
  DELETE_POST = 'DELETE_POST',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_USERS = 'MANAGE_USERS',
}

// Define role-based permissions
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.MANAGER]: [
    Permission.CREATE_POST,
    Permission.EDIT_POST,
    Permission.DELETE_POST,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS,
  ],
  [Role.WAITER]: [
    Permission.CREATE_POST,
    Permission.EDIT_POST,
    Permission.DELETE_POST,
  ],
  [Role.HOST]: [],
  [Role.KITCHEN]: [],
  [Role.CASHIER]: [],
  [Role.ACCOUNTANT]: [],
  [Role.EMPLOYEE]: [],
  [Role.CUSTOMER]: [],
  [Role.SUPPORT]: [],
  [Role.SYSTEM_ADMIN]: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export const employeeRole = [
  // Role.MANAGER,
  Role.WAITER,
  Role.HOST,
  Role.KITCHEN,
  Role.CASHIER,
  Role.ACCOUNTANT,
  Role.EMPLOYEE,
]