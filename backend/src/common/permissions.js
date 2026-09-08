export const permissions = Object.freeze({
  directory: ['admin', 'staff', 'manager', 'analyst'],
  employees: ['staff', 'manager', 'analyst'],
  analysis: ['staff', 'manager', 'analyst'],
  retention: ['staff', 'manager'],
  models: ['manager', 'analyst'],
  admin: ['admin'],
  validation: ['analyst'],
});

export function hasPermission(roleName, group, roleNames) {
  return (permissions[group] || []).some(key => roleNames[key] === roleName);
}
