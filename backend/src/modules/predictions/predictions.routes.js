import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './predictions.service.js';

export const permission = 'analysis';
export const createRouter = db => createReadRouter(createService(db));

