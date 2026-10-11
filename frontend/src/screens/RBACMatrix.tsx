import { AppShell } from '../components/AppShell';
import { Card, Button, ConfirmationDialog } from '../components/ui';
import { CheckCircle, RotateCcw, Save, Shield, XCircle } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { downloadTextFile, toCsv } from '../utils/demoActions';
import { RBAC_UPDATED_EVENT } from '../utils/rbacAccess';

const roles = ['HR', 'Data / AI Analyst', 'System Administrator', 'Employee / ESS'];

export const defaultPermissionMatrix: { category: string; items: { label: string; access: Record<string, boolean> }[] }[] = [
  {
    category: 'Employee Data',
    items: [
      { label: 'View Employee Directory', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Edit Employee Records', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Export Employee Data', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
    ],
  },
  {
    category: 'Attrition Risk',
    items: [
      { label: 'View Individual Risk Score', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'View Org-Level Risk', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Trigger Risk Analysis', access: { 'HR': false, 'Data / AI Analyst': true, 'System Administrator': false, 'Employee / ESS': false } },
    ],
  },
  {
    category: 'Retention Interventions',
    items: [
      { label: 'View Interventions', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Create / Update Interventions', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Escalate to Director', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
    ],
  },
  {
    category: 'Engagement Surveys',
    items: [
      { label: 'View Survey Results', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Launch Surveys', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Submit Assigned Surveys', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': true } },
    ],
  },
  {
    category: 'Employee Self Service',
    items: [
      { label: 'View Own Profile', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': true } },
      { label: 'Record Own Attendance', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': true } },
    ],
  },
  {
    category: 'Reports',
    items: [
      { label: 'View Executive Reports', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Generate & Export Reports', access: { 'HR': true, 'Data / AI Analyst': false, 'System Administrator': false, 'Employee / ESS': false } },
    ],
  },
  {
    category: 'AI & Data',
    items: [
      { label: 'Manage Data Pipelines', access: { 'HR': false, 'Data / AI Analyst': true, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'Configure AI Model', access: { 'HR': false, 'Data / AI Analyst': true, 'System Administrator': false, 'Employee / ESS': false } },
      { label: 'View Model Evaluation', access: { 'HR': false, 'Data / AI Analyst': true, 'System Administrator': false, 'Employee / ESS': false } },
    ],
  },
  {
    category: 'System Administration',
    items: [
      { label: 'Manage Users', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': true, 'Employee / ESS': false } },
      { label: 'Manage Roles & Permissions', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': true, 'Employee / ESS': false } },
      { label: 'System Configuration', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': true, 'Employee / ESS': false } },
      { label: 'View System Activity Logs', access: { 'HR': false, 'Data / AI Analyst': false, 'System Administrator': true, 'Employee / ESS': false } },
    ],
  },
];

const roleColors = ['bg-blue-50 text-blue-800', 'bg-orange-50 text-orange-800', 'bg-violet-50 text-violet-800', 'bg-slate-100 text-slate-700'];
export const RBAC_STORAGE_KEY = 'eris-rbac-matrix-v2';

export type PermissionMatrix = typeof defaultPermissionMatrix;

function cloneMatrix(matrix: PermissionMatrix): PermissionMatrix {
  return matrix.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, access: { ...item.access } })),
  }));
}

export function loadPermissionMatrix(): PermissionMatrix {
  try {
    const saved = localStorage.getItem(RBAC_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) ? parsed : cloneMatrix(defaultPermissionMatrix);
  } catch {
    return cloneMatrix(defaultPermissionMatrix);
  }
}

export function PermissionMatrixPanel() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => {
    return loadPermissionMatrix();
  });
  const [draft, setDraft] = useState<PermissionMatrix>(() => cloneMatrix(matrix));
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; description: string; action: () => void; tone?: 'default' | 'danger'; confirmLabel?: string } | null>(null);
  const activeMatrix = editing ? draft : matrix;

  useEffect(() => {
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(matrix));
    window.dispatchEvent(new Event(RBAC_UPDATED_EVENT));
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

  const applySaveChanges = () => {
    setMatrix(cloneMatrix(draft));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const saveChanges = () => {
    setConfirm({
      title: 'Confirm permission changes',
      description: 'These changes update sidebar visibility and route access for each role in this browser. Save the new access policy?',
      confirmLabel: 'Save Changes',
      action: applySaveChanges,
    });
  };

  const cancelChanges = () => {
    setDraft(cloneMatrix(matrix));
    setEditing(false);
  };

  const applyResetDefaults = () => {
    setMatrix(cloneMatrix(defaultPermissionMatrix));
    setDraft(cloneMatrix(defaultPermissionMatrix));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const resetDefaults = () => {
    setConfirm({
      title: 'Reset permissions to defaults?',
      description: 'This will discard all custom permission changes in the matrix and restore the original ERIS access policy.',
      confirmLabel: 'Reset',
      tone: 'danger',
      action: applyResetDefaults,
    });
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
        <div className={`rounded-lg border px-4 py-3 text-[13px] ${editing ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {editing
            ? `${changeCount} pending permission change${changeCount === 1 ? '' : 's'}. Click any check or x icon to grant/revoke access, then save.`
            : 'Permission catalog saved in this browser.'}
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
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors ${editing ? 'cursor-pointer hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-500' : 'cursor-default'}`}
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
      <ConfirmationDialog
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        description={confirm?.description || ''}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        tone={confirm?.tone || 'default'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
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
