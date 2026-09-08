export function createDashboardRepository(db) {
  return {
    async summary() {
      // Select latest result per active employee BEFORE grouping.
      // Employees without predictions remain visible as UNASSESSED.
      const { rows } = await db.query(`
        SELECT e.department_id, d.name AS department_name,
          count(*)::integer AS active_employees,
          count(*) FILTER (WHERE p.risk_level = 'LOW')::integer AS low,
          count(*) FILTER (WHERE p.risk_level = 'MEDIUM')::integer AS medium,
          count(*) FILTER (WHERE p.risk_level = 'HIGH')::integer AS high,
          count(*) FILTER (WHERE p.id IS NULL)::integer AS unassessed
        FROM public.employees e
        LEFT JOIN public.departments d ON d.id = e.department_id
        LEFT JOIN LATERAL (
          SELECT id, risk_level FROM public.predictions
          WHERE employee_id = e.id ORDER BY predicted_at DESC, id DESC LIMIT 1
        ) p ON true
        WHERE e.employment_status = 'ACTIVE'
        GROUP BY e.department_id, d.name ORDER BY d.name NULLS LAST`);
      return rows;
    },
  };
}
