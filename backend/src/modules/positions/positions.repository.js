import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "positions",
  "filters": [],
  "search": [
    "code",
    "name"
  ],
  "columns": [
    "id",
    "code",
    "name",
    "job_level",
    "description",
    "status",
    "created_at",
    "updated_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
