import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './outcomes.repository.js';

export const createService = db => createReadService(createRepository(db));

