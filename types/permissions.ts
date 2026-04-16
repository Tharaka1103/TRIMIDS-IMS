// types/permissions.ts

export const ROLES = {
  ADMIN: "admin",
  INTERN: "intern",
  EMPLOYEE: "employee",
  HR_MANAGER: "hr_manager",
  FINANCE_MANAGER: "finance_manager",
  MARKETING_MANAGER: "marketing_manager",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  // User Management
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",

  // Intern Management
  INTERN_VIEW: "intern:view",
  INTERN_CREATE: "intern:create",
  INTERN_EDIT: "intern:edit",
  INTERN_DELETE: "intern:delete",

  // Task Management
  TASK_VIEW: "task:view",
  TASK_CREATE: "task:create",
  TASK_EDIT: "task:edit",
  TASK_DELETE: "task:delete",
  TASK_ASSIGN: "task:assign",

  // Attendance
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_MANAGE: "attendance:manage",
  ATTENDANCE_SELF: "attendance:self",

  // Notifications
  NOTIFICATION_VIEW: "notification:view",
  NOTIFICATION_SEND: "notification:send",
  NOTIFICATION_BROADCAST: "notification:broadcast",

  // Maintenance
  MAINTENANCE_VIEW: "maintenance:view",
  MAINTENANCE_MANAGE: "maintenance:manage",
  MAINTENANCE_SCHEDULE: "maintenance:schedule",

  // Reports
  REPORT_VIEW: "report:view",
  REPORT_GENERATE: "report:generate",
  REPORT_EXPORT: "report:export",

  // Finance
  FINANCE_VIEW: "finance:view",
  FINANCE_MANAGE: "finance:manage",
  FINANCE_APPROVE: "finance:approve",

  // HR
  HR_VIEW: "hr:view",
  HR_MANAGE: "hr:manage",
  HR_RECRUITMENT: "hr:recruitment",

  // Marketing
  MARKETING_VIEW: "marketing:view",
  MARKETING_MANAGE: "marketing:manage",
  MARKETING_CAMPAIGNS: "marketing:campaigns",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  SYSTEM_SETTINGS: "settings:system",

  // Audit
  AUDIT_VIEW: "audit:view",

  // Dashboard Views
  DASHBOARD_ADMIN: "dashboard:admin",
  DASHBOARD_INTERN: "dashboard:intern",
  DASHBOARD_EMPLOYEE: "dashboard:employee",
  DASHBOARD_HR: "dashboard:hr",
  DASHBOARD_FINANCE: "dashboard:finance",
  DASHBOARD_MARKETING: "dashboard:marketing",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.values(PERMISSIONS) as Permission[],

  intern: [
    PERMISSIONS.DASHBOARD_INTERN,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.ATTENDANCE_SELF,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],

  employee: [
    PERMISSIONS.DASHBOARD_EMPLOYEE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.ATTENDANCE_SELF,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],

  hr_manager: [
    PERMISSIONS.DASHBOARD_HR,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.INTERN_VIEW,
    PERMISSIONS.INTERN_CREATE,
    PERMISSIONS.INTERN_EDIT,
    PERMISSIONS.HR_VIEW,
    PERMISSIONS.HR_MANAGE,
    PERMISSIONS.HR_RECRUITMENT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.NOTIFICATION_SEND,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
  ],

  finance_manager: [
    PERMISSIONS.DASHBOARD_FINANCE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.NOTIFICATION_SEND,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
  ],

  marketing_manager: [
    PERMISSIONS.DASHBOARD_MARKETING,
    PERMISSIONS.MARKETING_VIEW,
    PERMISSIONS.MARKETING_MANAGE,
    PERMISSIONS.MARKETING_CAMPAIGNS,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_GENERATE,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.NOTIFICATION_SEND,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
};