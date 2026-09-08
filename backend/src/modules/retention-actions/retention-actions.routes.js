import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './retention-actions.service.js';

export const permission = 'retention';
export const createRouter = db => createReadRouter(createService(db));

