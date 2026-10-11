import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, Tabs } from '../components/ui';
import { Database, Cpu, FileText, Settings, CheckCircle, ShieldCheck, BrainCircuit, ScrollText } from 'lucide-react';

function SettingRow({ label, value, editable = true, onSave }: { label: string; value: string; editable?: boolean; onSave?: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[13px] text-gray-600 w-56 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center justify-between">
        {editing ? (
          <input value={draft} onChange={e => setDraft(e.target.value)} className="h-8 min-w-0 flex-1 rounded border border-slate-300 px-2 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        ) : (
          <span className="text-[13px] font-medium text-gray-800">{value}</span>
        )}
        {editable && (
          <div className="ml-4 flex items-center gap-2">
            {editing ? (
              <>
                <button className="text-[12px] font-medium text-[#2563EB] hover:underline" onClick={() => { onSave?.(draft); setEditing(false); }}>Save</button>
                <button className="text-[12px] text-slate-500 hover:underline" onClick={() => { setDraft(value); setEditing(false); }}>Cancel</button>
              </>
            ) : (
              <button className="text-[12px] text-[#2563EB] hover:underline" onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemConfig() {
  const [tab, setTab] = useState('General');
  const [settings, setSettings] = useState<Record<string, string>>({
    'Application Name': 'ERIS — Employee Retention Intelligence System',
    'Default Language': 'English (US)',
    Timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
    'Date Format': 'MMM DD, YYYY',
    'Session Timeout': '30 minutes',
    'Password Minimum Length': '12 characters',
    'Multi-Factor Authentication': 'Enabled',
    'Login Attempt Limit': '5 attempts',
  });
  const saveSetting = (label: string, value: string) => setSettings(current => ({ ...current, [label]: value }));

  return (
    <AppShell breadcrumb={['System Configuration']}>
      <SectionHeader title="System Configuration" description="Manage application settings and operational status." />
      <Tabs tabs={['General', 'Security', 'AI Governance', 'Analysis', 'Reporting', 'Notifications']} active={tab} onChange={setTab} />

      {tab === 'General' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Card className="p-4 mb-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-3">Application Settings</div>
              {['Application Name', 'Default Language', 'Timezone', 'Date Format', 'Session Timeout'].map(label => (
                <SettingRow key={label} label={label} value={settings[label]} onSave={value => saveSetting(label, value)} />
              ))}
            </Card>
          </div>
          <div>
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-3">Service Status</div>
              <div className="space-y-2">
                {[
                  { label: 'Application', status: 'Operational', icon: <Settings size={14} className="text-green-500" /> },
                  { label: 'Database', status: 'Connected', icon: <Database size={14} className="text-green-500" /> },
                  { label: 'AI Analysis Service', status: 'Operational', icon: <Cpu size={14} className="text-green-500" /> },
                  { label: 'Reporting Service', status: 'Operational', icon: <FileText size={14} className="text-green-500" /> },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <span className="text-[13px] text-gray-700">{s.label}</span>
                    </div>
                    <span className="text-[12px] font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle size={11} /> {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Security' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Security Settings</div>
            <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
              {['Session Timeout', 'Password Minimum Length', 'Multi-Factor Authentication', 'Login Attempt Limit'].map(label => (
                <SettingRow key={label} label={label} value={settings[label]} onSave={value => saveSetting(label, value)} />
              ))}
              <SettingRow label="Audit Logging" value="Enabled" editable={false} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Security Coverage</div>
            <div className="space-y-2">
              {[
                ['Admin MFA', settings['Multi-Factor Authentication']],
                ['Password Policy', settings['Password Minimum Length']],
                ['Session Policy', settings['Session Timeout']],
                ['Login Protection', settings['Login Attempt Limit']],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                  <span className="text-[12px] text-slate-500">{label}</span>
                  <span className="text-[12px] font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'AI Governance' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-gray-800">
              <ShieldCheck size={16} className="text-indigo-600" /> Responsible AI Policy
            </div>
            <div className="divide-y divide-gray-100">
              <SettingRow label="Human Review Required" value="Enabled for all high-risk predictions" editable={false} />
              <SettingRow label="Automatic Employment Decisions" value="Blocked" editable={false} />
              <SettingRow label="Prediction Explanation" value="Required before intervention" editable={false} />
              <SettingRow label="Fairness Monitoring" value="Enabled — monthly review" editable={false} />
              <SettingRow label="Copilot Output Mode" value="Advisory draft only" editable={false} />
              <SettingRow label="Audit Retention" value="24 months" editable={false} />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-gray-800">
                <BrainCircuit size={16} className="text-indigo-600" /> AI Controls
              </div>
              <div className="space-y-2">
                {[
                  ['SHAP Explanations', 'Active'],
                  ['HR Copilot', 'Human-approved'],
                  ['Bias Alerts', 'Watch mode'],
                  ['Model Version', 'v2.3'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                    <span className="text-[12px] text-slate-500">{label}</span>
                    <span className="text-[12px] font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-gray-800">
                <ScrollText size={16} className="text-slate-600" /> Governance Checklist
              </div>
              <div className="space-y-2 text-[12px] leading-5 text-slate-600">
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">Audit trail records AI explanations, copilot suggestions, escalations, and fairness alerts.</div>
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">Segments flagged by fairness monitoring require HR/Data review before policy changes.</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">System Admin controls access, but does not act on employee-level risk without HR authorization.</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {(tab === 'Analysis' || tab === 'Reporting' || tab === 'Notifications') && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-2">{tab} Controls</div>
            <p className="text-[13px] leading-5 text-slate-500">Default policy and operating thresholds for this module.</p>
            <div className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-green-600">Active</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Owner</span><span className="font-semibold text-slate-800">System Administrator</span></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-2">Automation Rules</div>
            <p className="text-[13px] leading-5 text-slate-500">Rule-based actions used by HR, Data, and Admin workflows.</p>
            <div className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-slate-500">Enabled Rules</span><span className="font-semibold text-slate-800">6</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Last Updated</span><span className="font-semibold text-slate-800">Sep 24, 2026</span></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-2">Governance Notes</div>
            <p className="text-[13px] leading-5 text-slate-500">Configuration changes are tracked for audit review and role-based approval.</p>
            <div className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-slate-500">Audit Required</span><span className="font-semibold text-slate-800">Yes</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Approval Level</span><span className="font-semibold text-slate-800">Admin</span></div>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
