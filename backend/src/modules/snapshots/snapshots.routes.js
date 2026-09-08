import { createReadRouter } from '../../common/read-resource.js';
import { createService } from './snapshots.service.js';

export const permission = 'analysis';
export const createRouter = db => createReadRouter(createService(db));

