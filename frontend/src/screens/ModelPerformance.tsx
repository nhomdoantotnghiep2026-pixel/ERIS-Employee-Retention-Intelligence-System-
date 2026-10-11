import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, AIAdvisoryBanner } from '../components/ui';
import { AlertTriangle, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const confusionMatrix = {
  tp: 312, fp: 41,
  fn: 67,  tn: 580,
};

const metrics = [
  { label: 'Accuracy', value: '87.4%', desc: 'Overall correct predictions', color: 'text-indigo-700' },
  { label: 'Precision', value: '88.4%', desc: 'Of predicted High-risk, correct', color: 'text-green-700' },
  { label: 'Recall (Sensitivity)', value: '82.3%', desc: 'Of actual High-risk, caught', color: 'text-amber-700' },
  { label: 'F1 Score', value: '0.834', desc: 'Harmonic mean of P & R', color: 'text-indigo-700' },
  { label: 'AUC-ROC', value: '0.912', desc: 'Area under ROC curve', color: 'text-green-700' },
  { label: 'Log Loss', value: '0.287', desc: 'Prediction confidence penalty', color: 'text-slate-700' },
];

const thresholdRows = [
  { threshold: '0.50', precision: '88.4%', recall: '82.3%', f1: '0.852', selected: false },
  { threshold: '0.55', precision: '90.1%', recall: '79.6%', f1: '0.845', selected: false },
  { threshold: '0.60', precision: '91.7%', recall: '76.4%', f1: '0.834', selected: false },
  { threshold: '0.65', precision: '93.2%', recall: '72.8%', f1: '0.817', selected: true },
  { threshold: '0.70', precision: '94.5%', recall: '68.1%', f1: '0.791', selected: false },
];

const fairnessRows = [
  { segment: 'Engineering', group: 'Department', avgRisk: 48, highRiskRate: 14.6, falsePositiveRate: 5.8, status: 'Watch' },
  { segment: 'Sales', group: 'Department', avgRisk: 52, highRiskRate: 19.5, falsePositiveRate: 7.1, status: 'Review' },
  { segment: 'Operations', group: 'Department', avgRisk: 32, highRiskRate: 10.2, falsePositiveRate: 4.9, status: 'OK' },
  { segment: '< 2 years tenure', group: 'Tenure', avgRisk: 61, highRiskRate: 24.8, falsePositiveRate: 8.4, status: 'Review' },
  { segment: 'No overtime', group: 'Work pattern', avgRisk: 27, highRiskRate: 6.2, falsePositiveRate: 3.7, status: 'OK' },
];

const fairnessStatusStyle: Record<string, string> = {
  OK: 'bg-green-50 text-green-700 border-green-200',
  Watch: 'bg-amber-50 text-amber-700 border-amber-200',
  Review: 'bg-red-50 text-red-700 border-red-200',
};

export default function ModelPerformance() {
  const [matrix, setMatrix] = useState(confusionMatrix);
  const [evaluatedAt, setEvaluatedAt] = useState('Sep 2026 test set');
  const total = matrix.tp + matrix.fp + matrix.fn + matrix.tn;
  const reevaluate = () => {
    setMatrix(current => ({ ...current, tp: current.tp + 4, fp: Math.max(0, current.fp - 2), fn: Math.max(0, current.fn - 3), tn: current.tn + 1 }));
    setEvaluatedAt(new Date().toLocaleString());
  };

  return (
    <AppShell breadcrumb={['AI Model Operations', 'Model Performance']}>
      <SectionHeader title="Model Performance" description="Evaluation metrics for the active Gradient Boosting Classifier v2.3">
        <Button variant="secondary" size="sm" onClick={reevaluate}><RefreshCw size={13} /> Re-evaluate</Button>
      </SectionHeader>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {metrics.map(m => (
          <Card key={m.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 mb-1">{m.label}</div>
            <div className={`text-[26px] font-semibold font-mono leading-none ${m.color}`}>{m.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{m.desc}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Confusion Matrix */}
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-slate-800 mb-4">Confusion Matrix</div>
          <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-[6px] overflow-hidden text-center text-[13px]">
            <div className="bg-green-50 p-4">
              <div className="text-[11px] text-slate-400 mb-1">True Positive</div>
              <div className="text-[28px] font-bold text-green-700 font-mono">{matrix.tp}</div>
              <div className="text-[11px] text-green-600">{Math.round(matrix.tp / total * 100)}%</div>
            </div>
            <div className="bg-red-50 p-4">
              <div className="text-[11px] text-slate-400 mb-1">False Positive</div>
              <div className="text-[28px] font-bold text-red-500 font-mono">{matrix.fp}</div>
              <div className="text-[11px] text-red-500">{Math.round(matrix.fp / total * 100)}%</div>
            </div>
            <div className="bg-amber-50 p-4">
              <div className="text-[11px] text-slate-400 mb-1">False Negative</div>
              <div className="text-[28px] font-bold text-amber-500 font-mono">{matrix.fn}</div>
              <div className="text-[11px] text-amber-600">{Math.round(matrix.fn / total * 100)}%</div>
            </div>
            <div className="bg-green-50 p-4">
              <div className="text-[11px] text-slate-400 mb-1">True Negative</div>
              <div className="text-[28px] font-bold text-green-700 font-mono">{matrix.tn}</div>
              <div className="text-[11px] text-green-600">{Math.round(matrix.tn / total * 100)}%</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 text-center">
            Evaluated on {total} holdout samples ({evaluatedAt})
          </div>
        </Card>

        {/* Threshold analysis */}
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-slate-800 mb-3">Threshold Analysis</div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {['Threshold', 'Precision', 'Recall', 'F1'].map(h => (
                  <th key={h} className="py-2 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {thresholdRows.map(row => (
                <tr key={row.threshold} className={row.selected ? 'bg-indigo-50' : 'hover:bg-slate-50/60'}>
                  <td className="py-2.5 font-mono text-[13px] font-semibold text-slate-800">
                    {row.threshold}
                    {row.selected && <span className="ml-1.5 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-sans">Active</span>}
                  </td>
                  <td className="py-2.5 font-mono text-[13px] text-slate-700">{row.precision}</td>
                  <td className="py-2.5 font-mono text-[13px] text-slate-700">{row.recall}</td>
                  <td className={`py-2.5 font-mono text-[13px] font-semibold ${row.selected ? 'text-indigo-700' : 'text-slate-700'}`}>{row.f1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="mb-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-800">
              <ShieldCheck size={15} className="text-indigo-600" /> Bias & Fairness Monitoring
            </div>
            <div className="mt-0.5 text-[12px] text-slate-500">Checks whether risk scoring behaves unevenly across workforce segments</div>
          </div>
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">2 segments need review</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-2.5">Segment</th>
                <th className="px-3 py-2.5">Group</th>
                <th className="px-3 py-2.5">Avg Risk</th>
                <th className="px-3 py-2.5">High-Risk Rate</th>
                <th className="px-3 py-2.5">False Positive Rate</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fairnessRows.map(row => (
                <tr key={row.segment} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-[13px] font-medium text-slate-800">{row.segment}</td>
                  <td className="px-3 py-3 text-[13px] text-slate-500">{row.group}</td>
                  <td className="px-3 py-3 font-mono text-[13px] text-slate-700">{row.avgRisk}%</td>
                  <td className="px-3 py-3 font-mono text-[13px] text-slate-700">{row.highRiskRate}%</td>
                  <td className="px-3 py-3 font-mono text-[13px] text-slate-700">{row.falsePositiveRate}%</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium ${fairnessStatusStyle[row.status]}`}>
                      {row.status !== 'OK' && <AlertTriangle size={11} />} {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-[12px] leading-5 text-slate-500">
          Fairness monitoring is advisory. Segments marked Review should be checked by HR/Data teams before model outputs are used in retention decisions.
        </div>
      </Card>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
