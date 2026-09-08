import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './audit.repository.js';

export const createService = db => createReadService(createRepository(db));

