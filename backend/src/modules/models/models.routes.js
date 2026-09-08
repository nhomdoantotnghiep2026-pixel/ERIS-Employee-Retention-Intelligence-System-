import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './models.service.js';

export const permission = 'models';
export const createRouter = db => createReadRouter(createService(db));

