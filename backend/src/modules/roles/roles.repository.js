import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "role",
  "filters": [],
  "columns": [
    "id",
    "name",
    "description"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
