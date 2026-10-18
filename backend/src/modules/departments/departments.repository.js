import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "departments",
  "filters": [],
  "search": [
    "code",
    "name"
  ],
  "columns": [
    "id",
    "code",
    "name",
    "description",
    "status",
    "created_at",
    "updated_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
