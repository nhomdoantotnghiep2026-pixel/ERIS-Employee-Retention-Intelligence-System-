import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Tabs } from '../components/ui';
import { PermissionMatrixPanel } from './RBACMatrix';

const roles = [
  { name: 'HR Staff', description: 'View employees, search/filter data, review attrition risk results.', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { name: 'HR Manager', description: 'Review organization-level attrition patterns, compare departments, use reports.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Data / AI Analyst', description: 'Manage datasets, import and validate data, maintain the AI analysis component.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'System Administrator', description: 'Manage users, roles, permissions, and system configuration.', color: 'bg-violet-50 text-violet-700 border-violet-200' },
];

const permissionGroups = [
  { group: 'Employee Data', perms: ['View Employees', 'Export Employee Data', 'Edit Employee Records'] },
  { group: 'Risk Analysis', perms: ['View Risk Scores', 'View Factor Analysis', 'Run Analysis'] },
  { group: 'Reports', perms: ['View Reports', 'Generate Reports', 'Download Reports'] },
  { group: 'Data Management', perms: ['Import Data', 'Validate Data', 'Manage Datasets'] },
  { group: 'AI Model', perms: ['View Model Info', 'View Evaluation', 'Configure Model'] },
  { group: 'User Management', perms: ['View Users', 'Add Users', 'Edit Users', 'Deactivate Users'] },
  { group: 'System Configuration', perms: ['View Settings', 'Edit Settings', 'View Activity Logs'] },
];

const rolePermissions: Record<string, Record<string, boolean>> = {
  'HR Staff': { 'View Employees': true, 'Export Employee Data': false, 'Edit Employee Records': false, 'View Risk Scores': true, 'View Factor Analysis': true, 'Run Analysis': false, 'View Reports': true, 'Generate Reports': false, 'Download Reports': false, 'Import Data': false, 'Validate Data': false, 'Manage Datasets': false, 'View Model Info': false, 'View Evaluation': false, 'Configure Model': false, 'View Users': false, 'Add Users': false, 'Edit Users': false, 'Deactivate Users': false, 'View Settings': false, 'Edit Settings': false, 'View Activity Logs': false },
  'HR Manager': { 'View Employees': true, 'Export Employee Data': true, 'Edit Employee Records': false, 'View Risk Scores': true, 'View Factor Analysis': true, 'Run Analysis': false, 'View Reports': true, 'Generate Reports': true, 'Download Reports': true, 'Import Data': false, 'Validate Data': false, 'Manage Datasets': false, 'View Model Info': true, 'View Evaluation': true, 'Configure Model': false, 'View Users': false, 'Add Users': false, 'Edit Users': false, 'Deactivate Users': false, 'View Settings': false, 'Edit Settings': false, 'View Activity Logs': false },
  'Data / AI Analyst': { 'View Employees': true, 'Export Employee Data': true, 'Edit Employee Records': true, 'View Risk Scores': true, 'View Factor Analysis': true, 'Run Analysis': true, 'View Reports': true, 'Generate Reports': true, 'Download Reports': true, 'Import Data': true, 'Validate Data': true, 'Manage Datasets': true, 'View Model Info': true, 'View Evaluation': true, 'Configure Model': true, 'View Users': false, 'Add Users': false, 'Edit Users': false, 'Deactivate Users': false, 'View Settings': true, 'Edit Settings': false, 'View Activity Logs': false },
  'System Administrator': { 'View Employees': true, 'Export Employee Data': true, 'Edit Employee Records': true, 'View Risk Scores': true, 'View Factor Analysis': true, 'Run Analysis': true, 'View Reports': true, 'Generate Reports': true, 'Download Reports': true, 'Import Data': true, 'Validate Data': true, 'Manage Datasets': true, 'View Model Info': true, 'View Evaluation': true, 'Configure Model': true, 'View Users': true, 'Add Users': true, 'Edit Users': true, 'Deactivate Users': true, 'View Settings': true, 'Edit Settings': true, 'View Activity Logs': true },
};

export default function Roles() {
  const location = useLocation();
  const tabFromUrl = new URLSearchParams(location.search).get('tab') === 'matrix' ? 'Permission Matrix' : 'Role Overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [selectedRole, setSelectedRole] = useState('HR Manager');

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  return (
    <AppShell breadcrumb={['Roles & Permissions']}>
      <SectionHeader title="Roles & Permissions" description="Manage role definitions and the RBAC permission matrix from one place." />

      <Tabs tabs={['Role Overview', 'Permission Matrix']} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Role Overview' ? (
        <>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {roles.map(r => (
              <button
                key={r.name}
                onClick={() => setSelectedRole(r.name)}
                className={`min-h-[84px] rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  selectedRole === r.name
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-900 shadow-[0_1px_2px_rgba(79,70,229,0.14)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${r.color}`}>{r.name}</span>
                <span className="mt-2 block text-[12px] leading-5 text-slate-500">{r.description}</span>
              </button>
            ))}
          </div>

          <Card>
            <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-semibold text-slate-800">Permissions - {selectedRole}</span>
              <span className="text-[12px] text-slate-500">Read-only role summary. Use Permission Matrix to edit grants.</span>
            </div>
            <div className="divide-y divide-slate-100">
              {permissionGroups.map(g => (
                <div key={g.group} className="grid gap-3 px-4 py-3 lg:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{g.group}</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {g.perms.map(p => {
                      const checked = rolePermissions[selectedRole]?.[p] ?? false;
                      return (
                        <div key={p} className="flex min-h-9 items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
                          <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${checked ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300 bg-white'}`}>
                            {checked && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                            </svg>}
                          </div>
                          <span className={`text-[13px] ${checked ? 'text-slate-700' : 'text-slate-400'}`}>{p}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <PermissionMatrixPanel />
      )}
    </AppShell>
  );
}
