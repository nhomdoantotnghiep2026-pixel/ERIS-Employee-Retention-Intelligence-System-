import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './roles.repository.js';

export const createService = db => createReadService(createRepository(db));

