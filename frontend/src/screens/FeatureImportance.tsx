import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, AIAdvisoryBanner } from '../components/ui';
import { BrainCircuit, ShieldCheck } from 'lucide-react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

const features = [
  { name: 'Overtime', shap: 0.241, direction: 'risk', category: 'Work Conditions', desc: 'Employees working overtime are 2.4× more likely to leave' },
  { name: 'Job Satisfaction', shap: 0.198, direction: 'protective', category: 'Satisfaction', desc: 'Low satisfaction is the second strongest predictor of attrition' },
  { name: 'Years at Company', shap: 0.167, direction: 'protective', category: 'Tenure', desc: 'Shorter tenure significantly correlates with higher attrition probability' },
  { name: 'Work-Life Balance', shap: 0.142, direction: 'protective', category: 'Satisfaction', desc: 'Below-average scores strongly associated with attrition intent' },
  { name: 'Monthly Income', shap: 0.113, direction: 'protective', category: 'Compensation', desc: 'Compensation below market rate drives exits, especially in Sales' },
  { name: 'Business Travel', shap: 0.089, direction: 'risk', category: 'Work Conditions', desc: 'Frequent travel increases attrition risk by 1.7×' },
  { name: 'Age', shap: 0.050, direction: 'protective', category: 'Demographics', desc: 'Younger employees (22–28) show highest attrition probability' },
  { name: 'Job Level', shap: 0.038, direction: 'protective', category: 'Career', desc: 'Level 1–2 employees leave at higher rates than senior levels' },
  { name: 'Environment Satisfaction', shap: 0.032, direction: 'protective', category: 'Satisfaction', desc: 'Low env satisfaction adds moderate attrition signal' },
  { name: 'Distance from Home', shap: 0.021, direction: 'risk', category: 'Logistics', desc: 'Long commutes weakly correlated with attrition' },
];

const maxShap = Math.max(...features.map(f => f.shap));

const categoryColors: Record<string, string> = {
  'Work Conditions': 'bg-red-50 text-red-700 border-red-200',
  'Satisfaction': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tenure': 'bg-blue-50 text-blue-700 border-blue-200',
  'Compensation': 'bg-green-50 text-green-700 border-green-200',
  'Demographics': 'bg-violet-50 text-violet-700 border-violet-200',
  'Career': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Logistics': 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function FeatureImportance() {
  return (
    <AppShell breadcrumb={['AI Model Operations', 'Feature Importance (SHAP)']}>
      <SectionHeader title="Feature Importance (SHAP)" description="SHAP value analysis for model v2.3 — explaining what drives attrition predictions">
        <Button variant="secondary" size="sm" onClick={() => downloadTextFile('feature-importance-shap.csv', toCsv(features), 'text/csv;charset=utf-8')}>Export Report</Button>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Features Analyzed', value: features.length },
          { label: 'Risk-Increasing', value: features.filter(f => f.direction === 'risk').length, color: 'text-red-600' },
          { label: 'Protective Factors', value: features.filter(f => f.direction === 'protective').length, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${s.color || 'text-slate-900'}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="p-5">
            <div className="text-[14px] font-semibold text-slate-800 mb-4">SHAP Value Rankings</div>
            <div className="space-y-3">
              {features.map((f, i) => {
                const pct = (f.shap / maxShap) * 100;
                return (
                  <div key={f.name} className="flex items-center gap-3">
                    <div className="w-5 text-[11px] text-slate-300 font-mono text-right flex-shrink-0">{i + 1}</div>
                    <div className="w-36 text-[13px] text-slate-700 flex-shrink-0 truncate">{f.name}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.direction === 'risk' ? 'bg-red-400' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-14 text-right font-mono text-[12px] font-semibold text-slate-700 flex-shrink-0">
                      {f.shap.toFixed(3)}
                    </div>
                    <div className={`w-20 text-[11px] font-medium flex-shrink-0 ${f.direction === 'risk' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {f.direction === 'risk' ? '↑ Risk' : '↓ Risk'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" /> Increases attrition risk</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" /> Protective (reduces risk)</span>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-800">
              <ShieldCheck size={15} className="text-indigo-600" /> Responsible AI Guardrails
            </div>
            <div className="space-y-2 text-[12px] leading-5 text-slate-600">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Predictions are advisory and require HR review before action.</div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Every high-risk score must include an explanation and audit trail.</div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Model outputs must not be used for automatic termination or disciplinary decisions.</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[13px] font-semibold text-slate-800 mb-3">Feature Categories</div>
            <div className="space-y-2">
              {features.map(f => (
                <div key={f.name} className="flex items-start gap-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 mt-0.5 ${categoryColors[f.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {f.category}
                  </span>
                  <span className="text-[12px] text-slate-500 leading-snug">{f.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
