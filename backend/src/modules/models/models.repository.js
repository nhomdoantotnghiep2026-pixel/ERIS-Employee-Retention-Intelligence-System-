import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "model_versions",
  "columns": [
    "id",
    "version",
    "model_name",
    "accuracy",
    "precision_score",
    "recall_score",
    "f1_score",
    "is_active",
    "created_at"
  ],
  "filters": []
};
export const createRepository = db => createReadRepository(db, definition);

