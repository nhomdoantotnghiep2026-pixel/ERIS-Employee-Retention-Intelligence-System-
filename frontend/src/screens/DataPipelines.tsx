import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, StatusBadge } from '../components/ui';
import { GitBranch, RefreshCw, CheckCircle, AlertCircle, Clock, Play, Pause } from 'lucide-react';

const pipelines = [
  { name: 'HRIS → ERIS Daily Sync', source: 'Workday HRIS', dest: 'ERIS Employee DB', schedule: 'Daily 02:00 AM', lastRun: 'Sep 23, 2026 02:01', status: 'Success', records: 1247, duration: '1m 42s' },
  { name: 'Payroll Data Import', source: 'ADP Payroll', dest: 'ERIS Salary Records', schedule: 'Weekly Mon 03:00', lastRun: 'Sep 21, 2026 03:02', status: 'Success', records: 920, duration: '58s' },
  { name: 'Performance Reviews Sync', source: 'Lattice API', dest: 'ERIS Performance DB', schedule: 'Monthly 1st', lastRun: 'Sep 1, 2026 04:15', status: 'Success', records: 485, duration: '3m 12s' },
  { name: 'Survey Responses Import', source: 'SurveyMonkey API', dest: 'ERIS Engagement DB', schedule: 'Quarterly', lastRun: 'Sep 15, 2026 10:00', status: 'Warning', records: 198, duration: '22s' },
  { name: 'Exit Interview Data', source: 'Google Forms', dest: 'ERIS Offboarding DB', schedule: 'Real-time webhook', lastRun: 'Sep 22, 2026 14:30', status: 'Success', records: 3, duration: '2s' },
  { name: 'AI Feature Pipeline', source: 'ERIS Employee DB', dest: 'ML Feature Store', schedule: 'Daily 04:00 AM', lastRun: 'Sep 23, 2026 04:05', status: 'Error', records: 0, duration: 'Failed' },
];

const statusIcon: Record<string, typeof CheckCircle> = {
  Success: CheckCircle,
  Warning: AlertCircle,
  Error: AlertCircle,
  Running: Clock,
  Paused: Pause,
};
const statusColor: Record<string, string> = {
  Success: 'text-green-600',
  Warning: 'text-amber-600',
  Error: 'text-red-600',
  Running: 'text-indigo-600',
  Paused: 'text-slate-500',
};

export default function DataPipelines() {
  const [rows, setRows] = useState(pipelines);
  const [lastRefresh, setLastRefresh] = useState('Not refreshed this session');

  const refresh = () => {
    setLastRefresh(new Date().toLocaleTimeString());
    setRows(items => items.map(item => item.status === 'Running' ? { ...item, status: 'Success', lastRun: new Date().toLocaleString(), records: Math.max(item.records, 1247), duration: '1m 03s' } : item));
  };

  const addPipeline = () => {
    setRows(items => [
      {
        name: `Custom Workforce Import ${items.length + 1}`,
        source: 'CSV Upload',
        dest: 'ERIS Staging DB',
        schedule: 'Manual',
        lastRun: 'Never',
        status: 'Paused',
        records: 0,
        duration: '—',
      },
      ...items,
    ]);
  };

  const runPipeline = (name: string) => {
    setRows(items => items.map(item => item.name === name ? { ...item, status: 'Running', lastRun: new Date().toLocaleString(), duration: 'Running' } : item));
    window.setTimeout(() => {
      setRows(items => items.map(item => item.name === name ? { ...item, status: 'Success', records: item.records || 128, duration: '37s' } : item));
    }, 900);
  };

  const pausePipeline = (name: string) => {
    setRows(items => items.map(item => item.name === name ? { ...item, status: 'Paused', duration: 'Paused' } : item));
  };

  const counts = {
    active: rows.length,
    success: rows.filter(row => row.status === 'Success').length,
    warning: rows.filter(row => row.status === 'Warning').length,
    failed: rows.filter(row => row.status === 'Error').length,
  };

  return (
    <AppShell breadcrumb={['System & Data', 'Data Pipelines']}>
      <SectionHeader title="Data Pipelines" description="Import, export, and integration pipeline monitoring">
        <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={13} /> Refresh Status</Button>
        <Button variant="primary" size="sm" onClick={addPipeline}><GitBranch size={13} /> Add Pipeline</Button>
      </SectionHeader>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Pipelines', value: counts.active, color: 'text-slate-900' },
          { label: 'Successful (24h)', value: counts.success, color: 'text-green-600' },
          { label: 'Warnings', value: counts.warning, color: 'text-amber-600' },
          { label: 'Failed', value: counts.failed, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Pipeline', 'Source', 'Destination', 'Schedule', 'Last Run', 'Records', 'Duration', 'Status', ''].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(p => {
              const Icon = statusIcon[p.status];
              return (
                <tr key={p.name} className="hover:bg-slate-50/60">
                  <td className="px-3 h-[48px]">
                    <div className="text-[13px] font-semibold text-slate-800">{p.name}</div>
                  </td>
                  <td className="px-3 h-[48px] text-[12px] text-slate-500">{p.source}</td>
                  <td className="px-3 h-[48px] text-[12px] text-slate-500">{p.dest}</td>
                  <td className="px-3 h-[48px] text-[12px] font-mono text-slate-600">{p.schedule}</td>
                  <td className="px-3 h-[48px] text-[12px] text-slate-500">{p.lastRun}</td>
                  <td className="px-3 h-[48px] font-mono text-[13px] text-slate-700">{p.records > 0 ? p.records.toLocaleString() : '—'}</td>
                  <td className="px-3 h-[48px] font-mono text-[12px] text-slate-500">{p.duration}</td>
                  <td className="px-3 h-[48px]">
                    <span className={`flex items-center gap-1 text-[12px] font-medium ${statusColor[p.status]}`}>
                      <Icon size={13} /> {p.status}
                    </span>
                  </td>
                  <td className="px-3 h-[48px]">
                    <div className="flex gap-1">
                      <button aria-label={`Run ${p.name}`} onClick={() => runPipeline(p.name)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Play size={12} />
                      </button>
                      <button aria-label={`Pause ${p.name}`} onClick={() => pausePipeline(p.name)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors">
                        <Pause size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="mt-4">
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-slate-800 mb-3">Pipeline Error Log</div>
          <div className="bg-slate-900 rounded-[5px] p-3 font-mono text-[12px] text-slate-300 space-y-1">
            <div className="text-slate-500">[{lastRefresh}] INFO: Status refresh checkpoint</div>
            <div className="text-red-400">[2026-09-23 04:05:02] ERROR: AI Feature Pipeline — Connection timeout to ML Feature Store</div>
            <div className="text-red-400">[2026-09-23 04:05:02] ERROR: Retrying (1/3)... failed</div>
            <div className="text-amber-400">[2026-09-23 04:05:03] WARN: Partial data write — 0/1247 records committed</div>
            <div className="text-slate-500">[2026-09-23 04:05:03] INFO: Pipeline aborted. Next retry: 04:35 AM</div>
            <div className="text-green-400">[2026-09-23 02:01:42] INFO: HRIS Daily Sync completed — 1247 records updated</div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
