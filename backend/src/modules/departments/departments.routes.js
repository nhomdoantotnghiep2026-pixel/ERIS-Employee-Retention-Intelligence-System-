import { createCatalogRouter } from '../../common/catalog-resource.js';
import { createService } from './departments.service.js';

export const permission = 'catalog';
export const createRouter = db => createCatalogRouter(createService(db));

