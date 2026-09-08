import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "users",
  "columns": [
    "id",
    "email",
    "full_name",
    "role_id",
    "status",
    "created_at",
    "updated_at"
  ],
  "filters": [
    "role_id"
  ],
  "search": [
    "email",
    "full_name"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

