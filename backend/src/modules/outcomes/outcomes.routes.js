import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './outcomes.service.js';

export const permission = 'retention';
export const createRouter = db => createReadRouter(createService(db));

