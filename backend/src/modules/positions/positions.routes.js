import { createCatalogRouter } from '../../common/catalog-resource.js';
import { createService } from './positions.service.js';

export const permission = 'catalog';
export const createRouter = db => createCatalogRouter(createService(db));

