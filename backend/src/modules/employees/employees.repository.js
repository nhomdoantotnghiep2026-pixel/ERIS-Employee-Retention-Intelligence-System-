import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "employees",
  "columns": [
    "id",
    "employee_code",
    "full_name",
    "email",
    "gender",
    "date_of_birth",
    "hire_date",
    "department_id",
    "position_id",
    "manager_id",
    "employment_status",
    "salary",
    "created_at",
    "updated_at"
  ],
  "filters": [
    "department_id",
    "position_id",
    "manager_id"
  ],
  "search": [
    "employee_code",
    "full_name",
    "email"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

