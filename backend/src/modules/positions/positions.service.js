import { createCatalogService } from '../../common/catalog-resource.js';
import { definition } from './positions.repository.js';

export const createService = db => createCatalogService(db, definition);

