import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, Tabs, StatusBadge, AIAdvisoryBanner } from '../components/ui';
import { useState } from 'react';
import { Sliders, RefreshCw, Save, CheckCircle } from 'lucide-react';

const modelVersions = [
  { version: 'v2.3', deployed: true, accuracy: 87.4, auc: 0.912, f1: 0.834, trainedOn: 'Sep 1, 2026', records: 4821, notes: 'Added tenure × overtime interaction feature. Improved high-risk recall.' },
  { version: 'v2.2', deployed: false, accuracy: 85.1, auc: 0.893, f1: 0.811, trainedOn: 'Jun 15, 2026', records: 4620, notes: 'Baseline gradient boosting. Added department-level features.' },
  { version: 'v2.1', deployed: false, accuracy: 82.7, auc: 0.871, f1: 0.789, trainedOn: 'Mar 10, 2026', records: 4411, notes: 'Initial production model. Logistic regression baseline.' },
];

const featureWeights = [
  { feature: 'Overtime', weight: 0.241, direction: 'increases' },
  { feature: 'Job Satisfaction', weight: 0.198, direction: 'decreases' },
  { feature: 'Years at Company', weight: 0.167, direction: 'decreases' },
  { feature: 'Work-Life Balance', weight: 0.142, direction: 'decreases' },
  { feature: 'Monthly Income', weight: 0.113, direction: 'decreases' },
  { feature: 'Business Travel', weight: 0.089, direction: 'increases' },
  { feature: 'Age', weight: 0.050, direction: 'decreases' },
];

const thresholds = [
  { label: 'High Risk Threshold', value: 65, min: 50, max: 90, color: 'text-red-600' },
  { label: 'Medium Risk Threshold', value: 35, min: 20, max: 60, color: 'text-amber-600' },
];

export default function AIModelConfig() {
  const [tab, setTab] = useState('Model Versions');
  const [saved, setSaved] = useState(false);
  const [versions, setVersions] = useState(modelVersions);
  const active = versions.find(v => v.deployed) || versions[0];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const retrain = () => {
    const nextNumber = Math.max(...versions.map(v => Number(v.version.replace('v2.', '')))) + 1;
    const next = {
      version: `v2.${nextNumber}`,
      deployed: false,
      accuracy: 88.1,
      auc: 0.921,
      f1: 0.842,
      trainedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      records: 4928,
      notes: 'Retrained from current demo dataset with refreshed engagement and overtime features.',
    };
    setVersions([next, ...versions]);
    setTab('Model Versions');
  };

  const deploy = (version: string) => {
    setVersions(rows => rows.map(row => ({ ...row, deployed: row.version === version })));
  };

  return (
    <AppShell breadcrumb={['System & Data', 'AI Model Config']}>
      <SectionHeader title="AI Model Configuration" description="Manage attrition prediction model versions, features, and thresholds">
        <Button variant="secondary" size="sm" onClick={retrain}><RefreshCw size={13} /> Retrain Model</Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          {saved ? <><CheckCircle size={13} /> Saved</> : <><Save size={13} /> Save Config</>}
        </Button>
      </SectionHeader>

      {/* Active model summary */}
      <Card className="p-4 mb-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-[6px] flex items-center justify-center flex-shrink-0">
            <Sliders size={18} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-slate-800">Active Model: Gradient Boosting Classifier {active.version}</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Trained {active.trainedOn} · {active.records.toLocaleString()} employee records</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-6 text-center">
          {[
            { label: 'Accuracy', val: `${active.accuracy}%` },
            { label: 'AUC-ROC', val: active.auc.toString() },
            { label: 'F1 Score', val: active.f1.toString() },
          ].map(m => (
            <div key={m.label}>
              <div className="text-[20px] font-semibold text-indigo-700 leading-none">{m.val}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs tabs={['Model Versions', 'Feature Weights', 'Risk Thresholds']} active={tab} onChange={setTab} />

      {tab === 'Model Versions' && (
        <div className="space-y-3">
          {versions.map(v => (
            <Card key={v.version} className={`p-4 ${v.deployed ? 'ring-1 ring-indigo-300 border-indigo-200' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[14px] font-semibold text-slate-900">{v.version}</span>
                    {v.deployed && <StatusBadge status="Active" />}
                  </div>
                  <div className="text-[12px] text-slate-500">{v.notes}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Trained {v.trainedOn} · {v.records.toLocaleString()} records</div>
                </div>
                <div className="flex items-center gap-4 text-center flex-shrink-0">
                  {[
                    { label: 'Accuracy', val: `${v.accuracy}%` },
                    { label: 'AUC', val: v.auc.toString() },
                    { label: 'F1', val: v.f1.toString() },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="text-[16px] font-semibold text-slate-800 font-mono">{m.val}</div>
                      <div className="text-[10px] text-slate-400">{m.label}</div>
                    </div>
                  ))}
                  {!v.deployed && <Button variant="secondary" size="sm" onClick={() => deploy(v.version)}>Deploy</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Feature Weights' && (
        <Card className="p-4">
          <div className="text-[13px] text-slate-500 mb-4">Feature importance scores for model v2.3. Higher weight = stronger predictor.</div>
          <div className="space-y-3">
            {featureWeights.map(f => (
              <div key={f.feature} className="flex items-center gap-3">
                <div className="w-40 text-[13px] text-slate-700 flex-shrink-0">{f.feature}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.direction === 'increases' ? 'bg-red-400' : 'bg-green-500'}`}
                    style={{ width: `${f.weight * 400}%` }}
                  />
                </div>
                <div className="w-12 text-right font-mono text-[13px] font-medium text-slate-700">{f.weight.toFixed(3)}</div>
                <div className={`w-24 text-[11px] ${f.direction === 'increases' ? 'text-red-500' : 'text-green-600'}`}>
                  ↑ {f.direction} risk
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'Risk Thresholds' && (
        <Card className="p-5">
          <div className="text-[13px] text-slate-500 mb-5">Configure score thresholds for risk classification. Changes take effect on the next analysis run.</div>
          <div className="space-y-6">
            {thresholds.map(t => (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-medium text-slate-800">{t.label}</span>
                  <span className={`font-mono text-[18px] font-semibold ${t.color}`}>{t.value}%</span>
                </div>
                <input
                  type="range"
                  min={t.min}
                  max={t.max}
                  defaultValue={t.value}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>{t.min}%</span><span>{t.max}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-[5px] text-[12px] text-amber-700">
            Adjusting thresholds affects the number of employees classified in each risk band. Review impact on intervention workload before saving.
          </div>
        </Card>
      )}

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
