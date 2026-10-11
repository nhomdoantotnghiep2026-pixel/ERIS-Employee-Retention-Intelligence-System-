import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, RiskBadge, Button, AIAdvisoryBanner } from '../components/ui';
import { employees } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BrainCircuit, ClipboardList, ShieldCheck } from 'lucide-react';

const flagged = employees.filter(e => e.riskLevel === 'High' || e.riskLevel === 'Medium')
  .sort((a, b) => b.riskScore - a.riskScore);

const riskFactorMap: Record<string, string[]> = {
  '1': ['Overtime', 'Low job satisfaction', 'Short tenure'],
  '2': ['Frequent travel', 'Low income', 'Low work-life balance'],
  '6': ['Frequent travel', 'Overtime', 'Low env satisfaction'],
  '9': ['Overtime', 'Low satisfaction', 'Short tenure'],
  '3': ['Average satisfaction', 'Moderate tenure'],
  '5': ['Overtime', 'Average satisfaction'],
  '8': ['Frequent travel', 'Average satisfaction'],
  '11': ['Average satisfaction', 'Moderate tenure'],
  '12': ['Overtime', 'Below-avg satisfaction'],
};

export default function StaffRiskMonitor() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb={['Workforce Management', 'Attrition Risk Monitor']}>
      <SectionHeader title="Attrition Risk Monitor" description="Flagged employees requiring intervention or monitoring" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'High Risk', value: employees.filter(e => e.riskLevel === 'High').length, color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
          { label: 'Medium Risk', value: employees.filter(e => e.riskLevel === 'Medium').length, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' },
          { label: 'Requiring Action', value: 3, color: 'text-indigo-700', bg: 'bg-indigo-50', bar: 'bg-indigo-500' },
        ].map(s => (
          <Card key={s.label} className="overflow-hidden p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{s.label}</div>
                <div className={`mt-1 text-[26px] font-semibold leading-none ${s.color}`}>{s.value}</div>
              </div>
              <span className={`h-9 w-1.5 rounded-full ${s.bar}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-800">
            <BrainCircuit size={15} className="text-indigo-600" /> Simple AI Explanation
          </div>
          <p className="text-[12px] leading-5 text-slate-500">Each flagged employee includes key factors such as overtime, satisfaction, travel, or tenure so HR Staff can understand why follow-up is needed.</p>
        </Card>
        <Card className="p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-800">
            <ClipboardList size={15} className="text-emerald-600" /> Suggested Follow-up
          </div>
          <p className="text-[12px] leading-5 text-slate-500">Use the key factors to prepare check-ins, update intervention tasks, or escalate to HR Manager when authority is required.</p>
        </Card>
        <Card className="p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-800">
            <ShieldCheck size={15} className="text-amber-600" /> Human Review Required
          </div>
          <p className="text-[12px] leading-5 text-slate-500">AI risk scores are advisory. HR Staff should not make employment decisions directly from model output.</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-800">
            <AlertTriangle size={15} className="text-red-400" />
            Flagged Employees
          </div>
          <span className="shrink-0 text-[12px] text-slate-400">{flagged.length} employees</span>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[16%]" />
              <col className="w-[15%]" />
              <col className="w-[24%]" />
              <col className="w-[14%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee', 'Department', 'Risk Score', 'Key Factors', 'Last Analyzed', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flagged.map(emp => (
                <tr key={emp.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="truncate text-[13px] font-semibold text-slate-800">{emp.name}</div>
                    <div className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{emp.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">
                    <span className="block truncate">{emp.department}</span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={emp.riskLevel} score={emp.riskScore} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      {(riskFactorMap[emp.id] || ['-']).slice(0, 2).map(f => (
                        <span key={f} className="max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] leading-4 text-slate-600">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{emp.lastAnalysis}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => navigate(`/employees/${emp.id}`)}>
                      View <ArrowRight size={11} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {flagged.map(emp => (
            <div key={emp.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-slate-900">{emp.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
                    <span className="font-mono">{emp.employeeId}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{emp.department}</span>
                  </div>
                </div>
                <RiskBadge level={emp.riskLevel} score={emp.riskScore} />
              </div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <div className="min-w-0">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Key factors</div>
                  <div className="flex flex-wrap gap-1">
                    {(riskFactorMap[emp.id] || ['-']).slice(0, 3).map(f => (
                      <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] leading-4 text-slate-600">{f}</span>
                    ))}
                  </div>
                  <div className="mt-2 text-[12px] text-slate-500">Last analyzed: <span className="font-mono">{emp.lastAnalysis}</span></div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => navigate(`/employees/${emp.id}`)}>
                  View <ArrowRight size={11} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
