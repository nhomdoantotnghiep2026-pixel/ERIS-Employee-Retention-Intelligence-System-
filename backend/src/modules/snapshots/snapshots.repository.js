import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "ai_input",
  "filters": [
    "employee_id",
    "department_id",
    "position_id"
  ],
  "columns": [
    "id",
    "employee_id",
    "snapshot_date",
    "age",
    "department_id",
    "position_id",
    "job_level",
    "education_level",
    "monthly_income",
    "distance_from_home_km",
    "total_working_years",
    "years_at_company",
    "years_in_current_role",
    "years_since_last_promotion",
    "job_satisfaction",
    "environment_satisfaction",
    "overtime_hours",
    "created_at",
    "years_with_current_manager"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
