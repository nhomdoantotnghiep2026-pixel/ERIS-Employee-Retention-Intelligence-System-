import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './positions.service.js';

export const permission = 'directory';
export const createRouter = db => createReadRouter(createService(db));

