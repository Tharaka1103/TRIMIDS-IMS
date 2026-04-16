import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
} from "@/types/permissions";

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    admin: "Administrator",
    intern: "Intern",
    employee: "Employee",
    hr_manager: "HR Manager",
    finance_manager: "Finance Manager",
    marketing_manager: "Marketing Manager",
  };
  return names[role] || role;
}

export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    intern: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    employee:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    hr_manager:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    finance_manager:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    marketing_manager:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  };
  return colors[role] || "";
}