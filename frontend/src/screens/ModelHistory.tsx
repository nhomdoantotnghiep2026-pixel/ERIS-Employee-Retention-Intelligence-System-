import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, StatusBadge, AIAdvisoryBanner } from '../components/ui';
import { History, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const modelHistory = [
  { version: 'v2.3', trainedOn: 'Sep 1, 2026', deployed: 'Sep 1, 2026', accuracy: 87.4, auc: 0.912, f1: 0.834, records: 4821, status: 'Active', drift: 'None', notes: 'Tenure × overtime interaction term. Improved high-risk recall by 6pp.' },
  { version: 'v2.2', trainedOn: 'Jun 15, 2026', deployed: 'Jun 15, 2026', accuracy: 85.1, auc: 0.893, f1: 0.811, records: 4620, status: 'Retired', drift: 'Low', notes: 'Added department-level risk features. Salary quintile encoding.' },
  { version: 'v2.1', trainedOn: 'Mar 10, 2026', deployed: 'Mar 10, 2026', accuracy: 82.7, auc: 0.871, f1: 0.789, records: 4411, status: 'Retired', drift: 'Medium', notes: 'Gradient boosting introduced. Replaced logistic regression baseline.' },
  { version: 'v2.0', trainedOn: 'Dec 5, 2025', deployed: 'Dec 5, 2025', accuracy: 79.3, auc: 0.842, f1: 0.756, records: 4100, status: 'Retired', drift: 'High', notes: 'Initial gradient boosting. Baseline feature set only.' },
  { version: 'v1.0', trainedOn: 'Jun 1, 2025', deployed: 'Jun 1, 2025', accuracy: 73.1, auc: 0.801, f1: 0.712, records: 3850, status: 'Archived', drift: 'High', notes: 'Logistic regression. Proof-of-concept model.' },
];

const driftData = [
  { month: 'Apr', score: 0.02 },
  { month: 'May', score: 0.03 },
  { month: 'Jun', score: 0.04 },
  { month: 'Jul', score: 0.06 },
  { month: 'Aug', score: 0.05 },
  { month: 'Sep', score: 0.04 },
];

const driftMax = 0.20;

const driftStyles: Record<string, string> = {
  None: 'text-green-600',
  Low: 'text-amber-500',
  Medium: 'text-orange-600',
  High: 'text-red-600',
};

export default function ModelHistory() {
  const [rows, setRows] = useState(modelHistory);
  const triggerRetrain = () => {
    const next = {
      version: `v2.${rows.length + 1}`,
      trainedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deployed: 'Pending review',
      accuracy: 88.0,
      auc: 0.92,
      f1: 0.84,
      records: 4928,
      status: 'Active',
      drift: 'None',
      notes: 'Triggered manually from model history screen.',
    };
    setRows([next, ...rows.map(row => row.status === 'Active' ? { ...row, status: 'Retired' } : row)]);
  };

  return (
    <AppShell breadcrumb={['AI Model Operations', 'Model History & Drift']}>
      <SectionHeader title="Model History & Drift" description="Version history and data drift monitoring for the attrition prediction model">
        <Button variant="primary" size="sm" onClick={triggerRetrain}><History size={13} /> Trigger Retrain</Button>
      </SectionHeader>

      {/* Drift monitor */}
      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold text-slate-800">Data Drift Monitor — v2.3 (Active)</div>
          <div className="flex items-center gap-1.5 text-[12px] text-green-600 font-medium">
            <CheckCircle size={13} /> No critical drift detected
          </div>
        </div>
        <div className="flex items-end gap-2 h-20">
          {driftData.map((d, i) => {
            const barH = Math.round((d.score / driftMax) * 100);
            const isHigh = d.score > 0.10;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500">{d.score.toFixed(2)}</span>
                <div className="w-full flex items-end" style={{ height: '48px' }}>
                  <div
                    className={`w-full rounded-t-[3px] ${isHigh ? 'bg-red-400' : 'bg-indigo-400'}`}
                    style={{ height: `${barH}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{d.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
          <span>PSI score (Population Stability Index). Threshold: 0.10 = Low drift, 0.20 = High drift</span>
        </div>
      </Card>

      {/* Version history table */}
      <Card>
        <div className="px-4 py-3 border-b border-slate-100 text-[14px] font-semibold text-slate-800">Version History</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Version', 'Trained', 'Accuracy', 'AUC-ROC', 'F1', 'Records', 'Drift', 'Status', 'Notes'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(m => (
              <tr key={m.version} className={`hover:bg-slate-50/60 ${m.status === 'Active' ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-3 h-[52px]">
                  <span className="font-mono text-[13px] font-semibold text-slate-900">{m.version}</span>
                </td>
                <td className="px-3 h-[52px] text-[12px] text-slate-500">{m.trainedOn}</td>
                <td className="px-3 h-[52px] font-mono text-[13px] font-semibold text-slate-700">{m.accuracy}%</td>
                <td className="px-3 h-[52px] font-mono text-[13px] text-slate-600">{m.auc}</td>
                <td className="px-3 h-[52px] font-mono text-[13px] text-slate-600">{m.f1}</td>
                <td className="px-3 h-[52px] font-mono text-[12px] text-slate-500">{m.records.toLocaleString()}</td>
                <td className="px-3 h-[52px]">
                  <span className={`text-[12px] font-semibold ${driftStyles[m.drift]}`}>{m.drift}</span>
                </td>
                <td className="px-3 h-[52px]">
                  <StatusBadge status={m.status === 'Active' ? 'Active' : m.status === 'Retired' ? 'Inactive' : 'Resolved'} />
                </td>
                <td className="px-3 h-[52px] text-[12px] text-slate-500 max-w-[200px] truncate">{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
