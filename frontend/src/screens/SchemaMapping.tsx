import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, StatusBadge } from '../components/ui';
import { Table2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const schemas = [
  {
    source: 'Workday HRIS',
    table: 'employees_raw',
    fields: [
      { sourceField: 'emp_id', targetField: 'employee_id', type: 'VARCHAR(20)', mapped: true, required: true },
      { sourceField: 'full_name', targetField: 'name', type: 'VARCHAR(100)', mapped: true, required: true },
      { sourceField: 'dept_code', targetField: 'department', type: 'VARCHAR(50)', mapped: true, required: true },
      { sourceField: 'job_title', targetField: 'role', type: 'VARCHAR(100)', mapped: true, required: true },
      { sourceField: 'hire_dt', targetField: 'hire_date', type: 'DATE', mapped: true, required: true },
      { sourceField: 'monthly_sal', targetField: 'monthly_income', type: 'NUMERIC(10,2)', mapped: true, required: true },
      { sourceField: 'ot_flag', targetField: 'overtime', type: 'BOOLEAN', mapped: true, required: false },
      { sourceField: 'travel_freq', targetField: 'business_travel', type: 'VARCHAR(20)', mapped: true, required: false },
      { sourceField: 'perf_rating_raw', targetField: null, type: 'VARCHAR(5)', mapped: false, required: false },
    ],
  },
  {
    source: 'Survey Platform',
    table: 'survey_responses',
    fields: [
      { sourceField: 'resp_id', targetField: 'response_id', type: 'UUID', mapped: true, required: true },
      { sourceField: 'emp_ref', targetField: 'employee_id', type: 'VARCHAR(20)', mapped: true, required: true },
      { sourceField: 'q_job_sat', targetField: 'job_satisfaction', type: 'SMALLINT', mapped: true, required: false },
      { sourceField: 'q_wlb', targetField: 'work_life_balance', type: 'SMALLINT', mapped: true, required: false },
      { sourceField: 'q_env', targetField: 'environment_satisfaction', type: 'SMALLINT', mapped: true, required: false },
      { sourceField: 'open_text', targetField: null, type: 'TEXT', mapped: false, required: false },
    ],
  },
];

export default function SchemaMapping() {
  const [schemaRows, setSchemaRows] = useState(schemas);
  const syncSchemas = () => {
    setSchemaRows(rows => rows.map(schema => ({
      ...schema,
      fields: schema.fields.map(field => field.mapped ? field : { ...field, targetField: field.sourceField, mapped: true }),
    })));
  };
  const addMapping = () => {
    setSchemaRows(rows => rows.map((schema, index) => index === 0 ? {
      ...schema,
      fields: [...schema.fields, { sourceField: `custom_field_${schema.fields.length + 1}`, targetField: null, type: 'VARCHAR(100)', mapped: false, required: false }],
    } : schema));
  };
  const mappedCount = schemaRows.reduce((sum, schema) => sum + schema.fields.filter(field => field.mapped).length, 0);
  const unmappedCount = schemaRows.reduce((sum, schema) => sum + schema.fields.filter(field => !field.mapped).length, 0);

  return (
    <AppShell breadcrumb={['Data Management', 'Schema & Mapping']}>
      <SectionHeader title="Schema & Mapping" description="Field-level mapping between source systems and the ERIS data model">
        <Button variant="secondary" size="sm" onClick={syncSchemas}><RefreshCw size={13} /> Sync Schemas</Button>
        <Button variant="primary" size="sm" onClick={addMapping}><Table2 size={13} /> Add Mapping</Button>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Source Tables', value: schemaRows.length, color: 'text-slate-900' },
          { label: 'Mapped Fields', value: mappedCount, color: 'text-green-600' },
          { label: 'Unmapped Fields', value: unmappedCount, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {schemaRows.map(schema => (
          <Card key={schema.source}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[14px] font-semibold text-slate-800">{schema.source}</span>
                <span className="ml-2 font-mono text-[12px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{schema.table}</span>
              </div>
              <StatusBadge status="Active" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Source Field', 'Target Field', 'Type', 'Required', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schema.fields.map(f => (
                  <tr key={f.sourceField} className="hover:bg-slate-50/60">
                    <td className="px-4 h-[44px] font-mono text-[12px] text-slate-700">{f.sourceField}</td>
                    <td className="px-4 h-[44px] font-mono text-[12px]">
                      {f.targetField
                        ? <span className="text-indigo-700">{f.targetField}</span>
                        : <span className="text-slate-300 italic">— unmapped —</span>
                      }
                    </td>
                    <td className="px-4 h-[44px] font-mono text-[11px] text-slate-500">{f.type}</td>
                    <td className="px-4 h-[44px] text-[12px]">
                      {f.required ? <span className="text-red-500 font-medium">Required</span> : <span className="text-slate-400">Optional</span>}
                    </td>
                    <td className="px-4 h-[44px]">
                      {f.mapped
                        ? <span className="flex items-center gap-1 text-[12px] text-green-600"><CheckCircle size={13} /> Mapped</span>
                        : <span className="flex items-center gap-1 text-[12px] text-amber-600"><AlertCircle size={13} /> Unmapped</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
