import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './departments.service.js';

export const permission = 'directory';
export const createRouter = db => createReadRouter(createService(db));

