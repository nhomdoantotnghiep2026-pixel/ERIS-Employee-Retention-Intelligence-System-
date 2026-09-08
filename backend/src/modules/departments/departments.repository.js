import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "departments",
  "columns": [
    "id",
    "name",
    "description",
    "created_at",
    "updated_at"
  ],
  "filters": [],
  "search": [
    "name"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

