import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './users.service.js';

export const permission = 'admin';
export const createRouter = db => createReadRouter(createService(db));

