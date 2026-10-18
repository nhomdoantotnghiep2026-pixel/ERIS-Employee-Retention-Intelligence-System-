export const permissions = Object.freeze({
  catalog: ['staff'],
  employees: ['staff'],
  analysis: ['staff'],
  retention: ['staff'],
  models: ['staff'],
  admin: ['admin'],
  validation: ['staff'],
  distanceImport: ['admin', 'staff'],
});

export function hasPermission(roleName, group, roleNames) {
  return (permissions[group] || []).some(key => roleNames[key] === roleName);
}
