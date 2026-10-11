import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, StatusBadge } from '../components/ui';
import { validationIssues } from '../data/mockData';
import { CheckCircle } from 'lucide-react';

const filters = ['All Issues', 'Errors', 'Warnings', 'Resolved'];

export default function DataPreparation() {
  const [filter, setFilter] = useState('All Issues');
  const [ready, setReady] = useState(false);
  const [issues, setIssues] = useState(validationIssues);

  const markReady = () => {
    setReady(true);
    setIssues(items => items.map(item => ({ ...item, status: 'Resolved' })));
    setFilter('Resolved');
  };

  const filtered = issues.filter(i => {
    if (filter === 'Errors') return i.severity === 'Error';
    if (filter === 'Warnings') return i.severity === 'Warning';
    if (filter === 'Resolved') return i.status === 'Resolved';
    return true;
  });

  return (
    <AppShell breadcrumb={['Data Preparation']}>
      <SectionHeader title="Data Preparation" description="Validate and prepare employee data before attrition analysis.">
        <Button variant="primary" onClick={markReady}><CheckCircle size={13} /> {ready ? 'Dataset Ready' : 'Mark Dataset Ready'}</Button>
      </SectionHeader>

      {/* Summary row */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="px-5 py-3.5"><div className="text-[12px] text-gray-500 mb-1">Total Records</div><div className="text-[24px] font-semibold text-gray-900">1,248</div></Card>
        <Card className="px-5 py-3.5"><div className="text-[12px] text-gray-500 mb-1">Valid</div><div className="text-[24px] font-semibold text-green-600">{ready ? '1,248' : '1,186'}</div></Card>
        <Card className="px-5 py-3.5"><div className="text-[12px] text-gray-500 mb-1">Warnings</div><div className="text-[24px] font-semibold text-amber-600">{ready ? 0 : 48}</div></Card>
        <Card className="px-5 py-3.5"><div className="text-[12px] text-gray-500 mb-1">Errors</div><div className="text-[24px] font-semibold text-red-600">{ready ? 0 : 14}</div></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Filter tabs */}
          <div className="flex gap-0 border-b border-gray-200 mb-3">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px ${filter === f ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >{f}</button>
            ))}
          </div>
          <Card>
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[7%]" />
                <col className="w-[13%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[11%]" />
                <col className="w-[21%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Row', 'Employee ID', 'Field', 'Issue', 'Severity', 'Suggestion', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((issue, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="px-3 h-[44px] font-mono text-[12px] text-gray-400">{issue.row}</td>
                    <td className="px-3 h-[44px] font-mono text-[12px] text-gray-500">{issue.empId}</td>
                    <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{issue.field}</td>
                    <td className="px-3 h-[44px] text-[13px] text-gray-600">{issue.issue}</td>
                    <td className="px-3 h-[44px]">
                      <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded ${issue.severity === 'Error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-3 h-[44px] text-[12px] text-gray-500">
                      <span className="line-clamp-2">{issue.suggestion}</span>
                    </td>
                    <td className="px-3 h-[44px]"><StatusBadge status={issue.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-[13px] text-gray-400">No issues in this category.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Preparation Status</div>
            <div className="space-y-0">
              {[
                { label: 'Data Validation', status: 'Completed' },
                { label: 'Missing Value Handling', status: 'Completed' },
                { label: 'Data Transformation', status: 'Completed' },
                { label: 'Ready for Analysis', status: ready ? 'Yes' : 'Pending' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-[13px] text-gray-600">{s.label}</span>
                  <span className={`text-[12px] font-medium ${s.status === 'Completed' || s.status === 'Yes' ? 'text-green-600' : 'text-amber-600'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[11px] text-gray-400 mb-0.5">Dataset</div>
              <div className="text-[13px] text-gray-700">Employee Dataset 2026-Q3</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Sep 22, 2026</div>
            </div>
            <div className="mt-3">
              <Button variant="primary" size="sm" className="w-full justify-center" onClick={markReady}><CheckCircle size={12} /> {ready ? 'Dataset Ready' : 'Mark Dataset Ready'}</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
