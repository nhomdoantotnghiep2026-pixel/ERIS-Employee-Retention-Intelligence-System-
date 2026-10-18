import { createCatalogService } from '../../common/catalog-resource.js';
import { definition } from './departments.repository.js';

export const createService = db => createCatalogService(db, definition);

