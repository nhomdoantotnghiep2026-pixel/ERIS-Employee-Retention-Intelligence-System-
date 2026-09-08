import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "roles",
  "columns": [
    "id",
    "name",
    "description",
    "created_at"
  ],
  "filters": []
};
export const createRepository = db => createReadRepository(db, definition);

