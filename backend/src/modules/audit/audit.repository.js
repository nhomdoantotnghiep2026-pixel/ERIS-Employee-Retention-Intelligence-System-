import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "audit_logs",
  "columns": [
    "id",
    "user_id",
    "action",
    "entity_type",
    "entity_id",
    "details",
    "created_at"
  ],
  "filters": [
    "user_id",
    "entity_id"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

