import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './employees.service.js';

export const permission = 'employees';
export const createRouter = db => createReadRouter(createService(db));

