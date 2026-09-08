import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './users.repository.js';

export const createService = db => createReadService(createRepository(db));

