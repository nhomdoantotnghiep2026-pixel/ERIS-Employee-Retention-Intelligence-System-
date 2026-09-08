import * as resource0 from './users/users.routes.js';
import * as resource1 from './roles/roles.routes.js';
import * as resource2 from './departments/departments.routes.js';
import * as resource3 from './positions/positions.routes.js';
import * as resource4 from './employees/employees.routes.js';
import * as resource5 from './snapshots/snapshots.routes.js';
import * as resource6 from './models/models.routes.js';
import * as resource7 from './predictions/predictions.routes.js';
import * as resource8 from './explanations/explanations.routes.js';
import * as resource9 from './retention-actions/retention-actions.routes.js';
import * as resource10 from './outcomes/outcomes.routes.js';
import * as resource11 from './audit/audit.routes.js';

export const resources = [
  { path: '/users', ...resource0 },
  { path: '/roles', ...resource1 },
  { path: '/departments', ...resource2 },
  { path: '/positions', ...resource3 },
  { path: '/employees', ...resource4 },
  { path: '/snapshots', ...resource5 },
  { path: '/models', ...resource6 },
  { path: '/predictions', ...resource7 },
  { path: '/explanations', ...resource8 },
  { path: '/retention-actions', ...resource9 },
  { path: '/outcomes', ...resource10 },
  { path: '/audit', ...resource11 },
];

