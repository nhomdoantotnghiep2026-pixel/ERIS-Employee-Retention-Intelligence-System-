import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "employees",
  "filters": [
    "department_id",
    "position_id"
  ],
  "search": [
    "employee_code",
    "full_name",
    "email"
  ],
  "columns": [
    "id",
    "employee_code",
    "full_name",
    "email",
    "phone",
    "date_of_birth",
    "gender",
    "address",
    "distance_from_home_km",
    "department_id",
    "position_id",
    "hire_date",
    "employment_type",
    "employment_status",
    "current_salary",
    "created_at",
    "updated_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
