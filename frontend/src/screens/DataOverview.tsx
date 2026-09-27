import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, StatusBadge } from '../components/ui';
import { dataRecords, modelHistory } from '../data/mockData';
import { Upload, Layers, Cpu, BarChart2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DataOverview() {
  return (
    <AppShell>
      <SectionHeader
        title="Data Overview"
        description="Summary of datasets, preparation status, and AI model for attrition analysis."
      />

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Total Records</div>
            <div className="text-[24px] font-semibold text-gray-900">1,248</div>
            <div className="text-[12px] text-gray-400">Employee Dataset 2026-Q3</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Valid Records</div>
            <div className="text-[24px] font-semibold text-green-600">1,186</div>
            <div className="text-[12px] text-gray-400">95.0% complete</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Warnings / Errors</div>
            <div className="text-[24px] font-semibold text-amber-600">62</div>
            <div className="text-[12px] text-gray-400">48 warnings · 14 errors</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Active Model</div>
            <div className="text-[24px] font-semibold text-gray-900">v2.3</div>
            <div className="text-[12px] text-green-600">Operational · Acc 87.2%</div>
          </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* Workflow summary */}
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-gray-800 mb-3">Workflow Summary</div>
          <div className="space-y-1.5">
            {[
              { label: 'Import Employee Data', icon: <Upload size={13} />, status: 'Ready' },
              { label: 'Validate & Prepare Data', icon: <Layers size={13} />, status: 'Complete' },
              { label: 'Active AI Model', icon: <Cpu size={13} />, status: 'v2.3' },
              { label: 'Model Evaluation', icon: <BarChart2 size={13} />, status: '87.2%' },
            ].map(a => (
              <div
                key={a.label}
                className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-gray-700 bg-slate-50 border border-gray-200"
                style={{ borderRadius: '5px' }}
              >
                <span className="flex items-center gap-2 text-gray-500">{a.icon} {a.label}</span>
                <span className="text-[12px] font-medium text-slate-700">{a.status}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Dataset status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold text-gray-800">Dataset Status</div>
          </div>
          <div className="space-y-0">
            {dataRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-[13px] font-medium text-gray-800">{r.name}</div>
                  <div className="text-[11px] text-gray-400">{r.department}</div>
                </div>
                <StatusBadge status={r.validationStatus} />
              </div>
            ))}
          </div>
        </Card>

        {/* Preparation status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold text-gray-800">Preparation Status</div>
          </div>
          <div className="space-y-0">
            {[
              { label: 'Data Validation', done: true },
              { label: 'Missing Value Handling', done: true },
              { label: 'Data Transformation', done: true },
              { label: 'Ready for Analysis', done: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-[13px] text-gray-600">{s.label}</span>
                {s.done
                  ? <CheckCircle size={13} className="text-green-500" />
                  : <AlertTriangle size={13} className="text-amber-500" />}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-[12px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5" style={{ borderRadius: '4px' }}>
              Dataset Ready for Analysis
            </span>
          </div>
        </Card>
      </div>

      {/* Model history */}
      <Card>
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[14px] font-medium text-gray-800">Model Version History</span>
        </div>
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[34%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Version', 'Status', 'Evaluation Date', 'Dataset', 'Accuracy', 'F1 Score'].map(h => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
