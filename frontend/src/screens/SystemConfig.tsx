import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, Tabs } from '../components/ui';
import { Database, Cpu, FileText, Settings, CheckCircle, ShieldCheck, BrainCircuit, ScrollText, BarChart3, BellRing, Mail, Clock3, HardDrive, LockKeyhole } from 'lucide-react';

const DEFAULT_SETTINGS: Record<string, string> = {
  'Application Name': 'ERIS — Employee Retention Intelligence System',
  'Default Language': 'English (US)',
  Timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
  'Date Format': 'MMM DD, YYYY',
  'Session Timeout': '30 minutes',
  'Password Minimum Length': '12 characters',
  'Multi-Factor Authentication': 'Enabled',
  'Login Attempt Limit': '5 attempts',
  'Risk Refresh Schedule': 'Daily at 02:00',
  'Monitoring Window': '90 days',
  'Minimum Data Completeness': '95%',
  'Risk Publication Approval': 'Data/AI review required',
  'Analysis Result Retention': '24 months',
  'Default Report Format': 'PDF',
  'Report Retention': '24 months',
  'Report Schedule Timezone': 'Asia/Ho_Chi_Minh',
  'Executive Approval': 'Required before distribution',
  'Email Notifications': 'Enabled',
  'In-app Notifications': 'Enabled',
  'Daily Digest Time': '08:00',
  'Escalation Recipients': 'HR Manager, HR Director',
};

const SETTINGS_STORAGE_KEY = 'eris-system-settings-v1';

function SettingRow({ label, value, editable = true, onSave }: { label: string; value: string; editable?: boolean; onSave?: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[13px] text-gray-600 w-56 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center justify-between">
        {editing ? (
          <input value={draft} onChange={e => setDraft(e.target.value)} className="h-8 min-w-0 flex-1 rounded border border-slate-300 px-2 text-[13px] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
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
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const saveSetting = (label: string, value: string) => setSettings(current => ({ ...current, [label]: value }));

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <AppShell breadcrumb={['System Configuration']}>
      <SectionHeader title="System Configuration" description="Define platform-wide policies. User access, activity logs, and live service health are managed in their dedicated modules." />
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
              <p className="mb-3 text-[12px] leading-5 text-slate-500">Read-only service summary. Use System Health Monitor for latency, incidents, and diagnostics.</p>
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
              <ShieldCheck size={16} className="text-orange-600" /> Responsible AI Policy
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
                <BrainCircuit size={16} className="text-orange-600" /> AI Controls
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

      {tab === 'Analysis' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-4">
            <div className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-gray-800"><BarChart3 size={16} className="text-orange-600" /> Attrition Analysis Policy</div>
            <p className="mb-3 text-[12px] leading-5 text-slate-500">Operational controls used when the Data/AI workspace publishes a risk analysis run. Model thresholds remain in Model Configuration.</p>
            {['Risk Refresh Schedule', 'Monitoring Window', 'Minimum Data Completeness', 'Risk Publication Approval', 'Analysis Result Retention'].map(label => (
              <SettingRow key={label} label={label} value={settings[label]} onSave={value => saveSetting(label, value)} />
            ))}
          </Card>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800">Control Boundary</div>
              <div className="mt-3 space-y-2 text-[12px] leading-5 text-slate-600">
                <div className="rounded-md bg-slate-50 px-3 py-2">System Admin defines platform defaults.</div>
                <div className="rounded-md bg-slate-50 px-3 py-2">Data/AI Analyst validates data and evaluates the model.</div>
                <div className="rounded-md bg-slate-50 px-3 py-2">HR reviews employee-level results and decides interventions.</div>
              </div>
            </Card>
            <Card className="border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-700" /><p className="text-[12px] leading-5 text-amber-900">Changing a threshold affects future analysis runs. Existing employee risk records remain unchanged for audit consistency.</p></div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Reporting' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-4">
            <div className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-gray-800"><FileText size={16} className="text-orange-600" /> Report Delivery Policy</div>
            <p className="mb-3 text-[12px] leading-5 text-slate-500">Defaults for generated files, scheduled delivery, approval, and storage.</p>
            {['Default Report Format', 'Report Retention', 'Report Schedule Timezone', 'Executive Approval'].map(label => (
              <SettingRow key={label} label={label} value={settings[label]} onSave={value => saveSetting(label, value)} />
            ))}
          </Card>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 text-[14px] font-semibold text-gray-800">Report Lifecycle</div>
              {[
                { icon: FileText, label: 'Generate', detail: 'HR creates an on-demand or scheduled report' },
                { icon: ShieldCheck, label: 'Approve', detail: 'Executive reports require designated approval' },
                { icon: Mail, label: 'Distribute', detail: 'Only verified company recipients are allowed' },
                { icon: HardDrive, label: 'Retain', detail: settings['Report Retention'] },
              ].map((item, index) => <div key={item.label} className="flex gap-3 border-b border-slate-100 py-2.5 last:border-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600"><item.icon size={15} /></span><div><p className="text-[12px] font-semibold text-slate-800">{index + 1}. {item.label}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{item.detail}</p></div></div>)}
            </Card>
          </div>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-4">
            <div className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-gray-800"><BellRing size={16} className="text-orange-600" /> Delivery Channels</div>
            <p className="mb-3 text-[12px] leading-5 text-slate-500">Configure how operational alerts are delivered. Employee risk details remain visible only to authorized HR users.</p>
            {['Email Notifications', 'In-app Notifications', 'Daily Digest Time', 'Escalation Recipients'].map(label => (
              <SettingRow key={label} label={label} value={settings[label]} onSave={value => saveSetting(label, value)} />
            ))}
          </Card>
          <Card className="p-4">
            <div className="mb-3 text-[14px] font-semibold text-gray-800">Event Routing</div>
            <div className="space-y-2">
              {[
                { icon: BrainCircuit, event: 'Model drift detected', target: 'Data/AI Analyst', cadence: 'Immediate' },
                { icon: ShieldCheck, event: 'Permission changed', target: 'System Administrator', cadence: 'Immediate' },
                { icon: BarChart3, event: 'New high-risk cohort', target: 'HR', cadence: 'Daily digest' },
                { icon: LockKeyhole, event: 'Repeated login failure', target: 'System Administrator', cadence: 'Immediate' },
              ].map(item => <div key={item.event} className="rounded-lg border border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2"><item.icon size={14} className="text-orange-600" /><span className="text-[12px] font-semibold text-slate-800">{item.event}</span></div><div className="mt-1.5 flex items-center justify-between pl-5 text-[11px] text-slate-500"><span>{item.target}</span><span className="flex items-center gap-1 font-medium text-slate-700"><Clock3 size={11} />{item.cadence}</span></div></div>)}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
