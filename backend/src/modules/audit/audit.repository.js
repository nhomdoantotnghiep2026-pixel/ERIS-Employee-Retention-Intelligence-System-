import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "audit_logs",
  "filters": [
    "user_id",
    "entity_id"
  ],
  "columns": [
    "id",
    "user_id",
    "entity_type",
    "entity_id",
    "action",
    "old_value",
    "new_value",
    "created_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
