import { AppShell } from '../components/AppShell';
import { Card, Button } from '../components/ui';
import { CheckCircle, RotateCcw, Save, Shield, XCircle } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

const roles = ['HR Staff', 'HR Manager', 'Data / AI Analyst', 'System Administrator'];

const permissions: { category: string; items: { label: string; access: Record<string, boolean> }[] }[] = [
  {
    category: 'Employee Data',
    items: [
      { label: 'View Employee Directory', access: { 'HR Staff': true, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': true } },
      { label: 'Edit Employee Records', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': true } },
      { label: 'Export Employee Data', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': true } },
    ],
  },
  {
    category: 'Attrition Risk',
    items: [
      { label: 'View Individual Risk Score', access: { 'HR Staff': true, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': false } },
      { label: 'View Org-Level Risk', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': false } },
      { label: 'Trigger Risk Analysis', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': false } },
    ],
  },
  {
    category: 'Retention Interventions',
    items: [
      { label: 'View Interventions', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': false } },
      { label: 'Create / Update Interventions', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': false } },
      { label: 'Escalate to Director', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': true } },
    ],
  },
  {
    category: 'Engagement Surveys',
    items: [
      { label: 'View Survey Results', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': false } },
      { label: 'Launch Surveys', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': false } },
    ],
  },
  {
    category: 'Reports',
    items: [
      { label: 'View Executive Reports', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': false, 'System Administrator': false } },
      { label: 'Generate & Export Reports', access: { 'HR Staff': false, 'HR Manager': true, 'Data / AI Analyst': true, 'System Administrator': true } },
    ],
  },
  {
    category: 'AI & Data',
    items: [
      { label: 'Manage Data Pipelines', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': true, 'System Administrator': true } },
      { label: 'Configure AI Model', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': true, 'System Administrator': false } },
      { label: 'View Model Evaluation', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': true, 'System Administrator': false } },
    ],
  },
  {
    category: 'System Administration',
    items: [
      { label: 'Manage Users', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': false, 'System Administrator': true } },
      { label: 'Manage Roles & Permissions', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': false, 'System Administrator': true } },
      { label: 'System Configuration', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': false, 'System Administrator': true } },
      { label: 'View System Activity Logs', access: { 'HR Staff': false, 'HR Manager': false, 'Data / AI Analyst': false, 'System Administrator': true } },
    ],
  },
];

const roleColors = ['bg-blue-50 text-blue-800', 'bg-indigo-50 text-indigo-800', 'bg-violet-50 text-violet-800', 'bg-slate-100 text-slate-700'];
const STORAGE_KEY = 'eris-rbac-matrix';

type PermissionMatrix = typeof permissions;

function cloneMatrix(matrix: PermissionMatrix): PermissionMatrix {
  return matrix.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, access: { ...item.access } })),
  }));
}

export function PermissionMatrixPanel() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : permissions;
    } catch {
      return permissions;
    }
  });
  const [draft, setDraft] = useState<PermissionMatrix>(() => cloneMatrix(matrix));
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const activeMatrix = editing ? draft : matrix;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
  }, [matrix]);

  const changeCount = useMemo(() => {
    let count = 0;
    draft.forEach((cat, catIndex) => {
      cat.items.forEach((item, itemIndex) => {
        roles.forEach(role => {
          if (item.access[role] !== matrix[catIndex]?.items[itemIndex]?.access[role]) count += 1;
        });
      });
    });
    return count;
  }, [draft, matrix]);

  const startEditing = () => {
    setDraft(cloneMatrix(matrix));
    setEditing(true);
    setSaved(false);
  };

  const saveChanges = () => {
    setMatrix(cloneMatrix(draft));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const cancelChanges = () => {
    setDraft(cloneMatrix(matrix));
    setEditing(false);
  };

  const resetDefaults = () => {
    setMatrix(cloneMatrix(permissions));
    setDraft(cloneMatrix(permissions));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const togglePermission = (category: string, label: string, role: string) => {
    if (!editing) return;
    setDraft(current => current.map(cat => cat.category === category ? {
      ...cat,
      items: cat.items.map(item => item.label === label ? { ...item, access: { ...item.access, [role]: !item.access[role] } } : item),
    } : cat));
  };
  const exportMatrix = () => {
    downloadTextFile('rbac-permissions-matrix.csv', toCsv(activeMatrix.flatMap(cat => cat.items.map(item => ({
      category: cat.category,
      permission: item.label,
      ...item.access,
    })))), 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-slate-900">RBAC Permissions Matrix</h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">Grant or revoke module permissions for each role from one consolidated matrix.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={exportMatrix}>Export Matrix</Button>
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={cancelChanges}>Cancel</Button>
              <Button variant="secondary" size="sm" onClick={resetDefaults}><RotateCcw size={13} /> Reset</Button>
              <Button variant="primary" size="sm" onClick={saveChanges}><Save size={13} /> Save Changes</Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={startEditing}><Shield size={13} /> Edit Permissions</Button>
          )}
        </div>
      </div>

      {(editing || saved) && (
        <div className={`rounded-lg border px-4 py-3 text-[13px] ${editing ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {editing
            ? `${changeCount} pending permission change${changeCount === 1 ? '' : 's'}. Click any check or x icon to grant/revoke access, then save.`
            : 'Permission changes saved for this browser session.'}
        </div>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed">
          <colgroup>
            <col className="w-[280px]" />
            {roles.map(role => <col key={role} className="w-[145px]" />)}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide w-64">Permission</th>
              {roles.map((role, i) => (
                <th key={role} className="px-3 py-3 text-center text-[12px] font-medium text-slate-500 uppercase tracking-wide w-36">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${roleColors[i]}`}>
                    {role}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeMatrix.map((cat, ci) => (
              <Fragment key={`cat-${ci}`}>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <td colSpan={roles.length + 1} className="px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    {cat.category}
                  </td>
                </tr>
                {cat.items.map((item, ii) => (
                  <tr key={`item-${ci}-${ii}`} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-4 h-[44px] text-[13px] text-slate-700">{item.label}</td>
                    {roles.map(role => (
                      <td key={role} className="px-3 h-[44px] text-center">
                        <button
                          aria-label={`${item.access[role] ? 'Revoke' : 'Grant'} ${item.label} for ${role}`}
                          aria-pressed={item.access[role]}
                          disabled={!editing}
                          onClick={() => togglePermission(cat.category, item.label, role)}
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors ${editing ? 'cursor-pointer hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-500' : 'cursor-default'}`}
                        >
                          {item.access[role]
                            ? <CheckCircle size={16} className="text-green-500" />
                            : <XCircle size={16} className="text-slate-200" />
                          }
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function RBACMatrix() {
  return (
    <AppShell breadcrumb={['Administration', 'Roles & Permissions', 'Permission Matrix']}>
      <PermissionMatrixPanel />
    </AppShell>
  );
}
