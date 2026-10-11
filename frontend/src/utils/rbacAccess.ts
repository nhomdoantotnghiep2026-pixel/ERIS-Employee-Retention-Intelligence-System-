import type { UserRole } from '../context/RoleContext';

export const RBAC_UPDATED_EVENT = 'eris-rbac-updated';
const RBAC_STORAGE_KEY = 'eris-rbac-matrix-v2';

const defaultRolesByPermission: Record<string, UserRole[]> = {
  'View Employee Directory': ['HR'],
  'Edit Employee Records': ['HR'],
  'View Individual Risk Score': ['HR'],
  'View Org-Level Risk': ['HR'],
  'View Interventions': ['HR'],
  'View Survey Results': ['HR'],
  'View Executive Reports': ['HR'],
  'View Own Profile': ['Employee / ESS'],
  'Record Own Attendance': ['Employee / ESS'],
  'Submit Assigned Surveys': ['Employee / ESS'],
  'Manage Data Pipelines': ['Data / AI Analyst'],
  'Configure AI Model': ['Data / AI Analyst'],
  'View Model Evaluation': ['Data / AI Analyst'],
  'Manage Users': ['System Administrator'],
  'Manage Roles & Permissions': ['System Administrator'],
  'System Configuration': ['System Administrator'],
  'View System Activity Logs': ['System Administrator'],
};

const permissionByRoute: Array<[string, string]> = [
  ['/employees/new', 'Edit Employee Records'],
  ['/employees/import', 'Edit Employee Records'],
  ['/employees/bulk-update', 'Edit Employee Records'],
  ['/employees/:id/risk', 'View Individual Risk Score'],
  ['/employees', 'View Employee Directory'],
  ['/org-overview', 'View Org-Level Risk'],
  ['/workforce-risk', 'View Org-Level Risk'],
  ['/attrition-risk', 'View Org-Level Risk'],
  ['/interventions', 'View Interventions'],
  ['/engagement', 'View Survey Results'],
  ['/executive-reports', 'View Executive Reports'],
  ['/reports', 'View Executive Reports'],
  ['/my-profile', 'View Own Profile'],
  ['/my-attendance', 'Record Own Attendance'],
  ['/my-surveys', 'Submit Assigned Surveys'],
  ['/data-pipelines', 'Manage Data Pipelines'],
  ['/preparation', 'Manage Data Pipelines'],
  ['/schema', 'Manage Data Pipelines'],
  ['/import', 'Manage Data Pipelines'],
  ['/data', 'Manage Data Pipelines'],
  ['/ai-config', 'Configure AI Model'],
  ['/model-performance', 'View Model Evaluation'],
  ['/feature-importance', 'View Model Evaluation'],
  ['/model-history', 'View Model Evaluation'],
  ['/audit-logs', 'Manage Data Pipelines'],
  ['/users', 'Manage Users'],
  ['/roles', 'Manage Roles & Permissions'],
  ['/rbac', 'Manage Roles & Permissions'],
  ['/system-health', 'System Configuration'],
  ['/system', 'System Configuration'],
  ['/activity', 'View System Activity Logs'],
];

function matchesRoute(pattern: string, pathname: string) {
  if (pattern.includes('/:id/')) {
    const [prefix, suffix] = pattern.split('/:id');
    return pathname.startsWith(`${prefix}/`) && pathname.endsWith(suffix);
  }
  return pathname === pattern || pathname.startsWith(`${pattern}/`);
}

export function permissionForRoute(pathname: string) {
  return permissionByRoute.find(([pattern]) => matchesRoute(pattern, pathname))?.[1] || null;
}

export function hasRoutePermission(role: UserRole, pathname: string) {
  const required = permissionForRoute(pathname);
  if (!required) return true;
  try {
    const saved = localStorage.getItem(RBAC_STORAGE_KEY);
    const matrix = saved ? JSON.parse(saved) : null;
    if (Array.isArray(matrix)) {
      const permission = matrix.flatMap(category => Array.isArray(category?.items) ? category.items : []).find(item => item?.label === required);
      if (permission?.access && typeof permission.access[role] === 'boolean') return permission.access[role];
    }
  } catch {
    // Fall back to the built-in policy when stored configuration is unavailable.
  }
  return defaultRolesByPermission[required]?.includes(role) ?? false;
}
