import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, Tabs } from '../components/ui';
import { modelHistory } from '../data/mockData';
import { Cpu, BarChart2, Eye } from 'lucide-react';

export default function AIModel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Current Model');

  return (
    <AppShell breadcrumb={['AI Model']}>
      <SectionHeader title="AI Model" description="Monitor and maintain the attrition analysis component used by ERIS." />

      {/* Model summary */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '6px' }}>
            <Cpu size={18} className="text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-[16px] font-semibold text-gray-900">Employee Attrition Prediction</span>
              <span className="text-[12px] bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 font-medium" style={{ borderRadius: '4px' }}>v2.3</span>
              <span className="text-[12px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 font-medium" style={{ borderRadius: '4px' }}>● Active</span>
            </div>
            <div className="text-[13px] text-gray-500">Binary classification model for employee attrition risk prediction with HR-oriented explainability.</div>
            <div className="flex items-center gap-6 mt-2">
              {[
                { label: 'Last Evaluated', value: 'Sep 20, 2026' },
                { label: 'Training Dataset', value: 'Employee Dataset 2026-Q3' },
                { label: 'Accuracy', value: '87.2%' },
                { label: 'F1 Score', value: '84.1%' },
              ].map(m => (
                <div key={m.label}>
                  <div className="text-[11px] text-gray-400">{m.label}</div>
                  <div className="text-[13px] font-semibold text-gray-800">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/model/eval')}>
            <BarChart2 size={13} /> View Evaluation
          </Button>
        </div>
      </Card>

      <Tabs tabs={['Current Model', 'Model History', 'Analysis Configuration']} active={tab} onChange={setTab} />

      {tab === 'Current Model' && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2 p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Performance Metrics</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {['Metric', 'Value', 'Description'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { metric: 'Accuracy', value: '87.2%', desc: 'Overall prediction correctness' },
                    { metric: 'Precision', value: '85.3%', desc: 'True positive rate among predicted positives' },
                    { metric: 'Recall', value: '83.2%', desc: 'Sensitivity — correctly identified attrition cases' },
                    { metric: 'F1 Score', value: '84.1%', desc: 'Harmonic mean of precision and recall' },
                    { metric: 'ROC-AUC', value: '0.921', desc: 'Area under the receiver operating characteristic curve' },
                  ].map(m => (
                    <tr key={m.metric} className="hover:bg-gray-50/60">
                      <td className="px-3 h-[40px] text-[13px] font-medium text-gray-800">{m.metric}</td>
                      <td className="px-3 h-[40px] text-[14px] font-bold text-[#2563EB]">{m.value}</td>
                      <td className="px-3 h-[40px] text-[13px] text-gray-500">{m.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Explainability Status</div>
            <div className="space-y-2">
              {[
                ['Explanations Available', true],
                ['Generated Successfully', true],
                ['Ready for HR Display', true],
                ['Factor Analysis Active', true],
              ].map(([label, ok]) => (
                <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[13px] text-gray-600">{label as string}</span>
                  <span className="text-[12px] font-medium text-green-600">✓ Yes</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400 leading-relaxed">
              Explainability results are reviewed before operational display to ensure appropriate quality for HR users.
            </div>
          </Card>
        </div>
      )}

      {tab === 'Model History' && (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Version', 'Status', 'Evaluation Date', 'Dataset', 'Accuracy', 'F1 Score', 'Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modelHistory.map(m => (
                <tr key={m.version} className="hover:bg-gray-50/60">
                  <td className="px-3 h-[44px] font-mono text-[13px] font-medium text-gray-800">{m.version}</td>
                  <td className="px-3 h-[44px]">
                    <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded border ${m.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-3 h-[44px] text-[13px] text-gray-600">{m.evalDate}</td>
                  <td className="px-3 h-[44px] text-[13px] text-gray-600">{m.dataset}</td>
                  <td className="px-3 h-[44px] text-[13px] font-semibold text-gray-800">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-3 h-[44px] text-[13px] text-gray-600">{(m.f1 * 100).toFixed(1)}%</td>
                  <td className="px-3 h-[44px]">
                    <button className="text-[13px] text-[#2563EB] hover:underline flex items-center gap-1" onClick={() => navigate('/model/eval')}>
                      <Eye size={12} /> Evaluation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Analysis Configuration' && (
        <Card className="p-4 max-w-lg">
          <div className="text-[14px] font-semibold text-gray-800 mb-3">Analysis Settings</div>
          <div className="space-y-0">
            {[
              { label: 'Active Model Version', value: 'v2.3' },
              { label: 'Risk Threshold — High', value: '≥ 65%' },
              { label: 'Risk Threshold — Medium', value: '35% – 64%' },
              { label: 'Explainability Method', value: 'SHAP-based factor attribution' },
              { label: 'Max Factors Displayed', value: '7 factors' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-[13px] text-gray-600">{s.label}</span>
                <span className="text-[13px] font-medium text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
