import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "positions",
  "columns": [
    "id",
    "title",
    "level",
    "description",
    "created_at",
    "updated_at"
  ],
  "filters": [],
  "search": [
    "title"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

