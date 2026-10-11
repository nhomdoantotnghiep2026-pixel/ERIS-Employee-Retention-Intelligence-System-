import { type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare, Target, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AIAdvisoryBanner, Button, Card, RiskBadge, SectionHeader } from '../components/ui';
import { departments, employees } from '../data/mockData';

const recentInterventions = [
  { name: 'Nguyen Van A', dept: 'Engineering', status: 'In Progress', date: 'Sep 20, 2026' },
  { name: 'Tran Thi B', dept: 'Sales', status: 'Action Required', date: 'Sep 19, 2026' },
  { name: 'Nguyen Thi F', dept: 'Marketing', status: 'Resolved', date: 'Sep 15, 2026' },
  { name: 'Bui Thi I', dept: 'Engineering', status: 'In Progress', date: 'Sep 14, 2026' },
];

const interventionStatusStyle: Record<string, string> = {
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Action Required': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Resolved': 'bg-green-50 text-green-700 border border-green-200',
};

function riskPriority(emp: (typeof employees)[number]) {
  let score = emp.riskScore;
  if (emp.overtime) score += 6;
  if (emp.jobSatisfaction <= 2) score += 5;
  if (emp.businessTravel === 'Frequently') score += 4;
  return score;
}

function getTopFactors(emp: (typeof employees)[number]) {
  const factors: string[] = [];
  if (emp.overtime) factors.push('Overtime');
  if (emp.jobSatisfaction <= 2) factors.push('Low satisfaction');
  if (emp.businessTravel === 'Frequently') factors.push('Frequent travel');
  if (emp.workLifeBalance <= 2) factors.push('Work-life balance');
  if (emp.monthlyIncome < 4500) factors.push('Low income');
  return factors.slice(0, 2);
}

const highRiskEmps = employees
  .filter(e => e.riskLevel === 'High')
  .sort((a, b) => riskPriority(b) - riskPriority(a))
  .slice(0, 5);

const topDepartments = [...departments]
  .sort((a, b) => (b.highRisk / b.employees) - (a.highRisk / a.employees))
  .slice(0, 5);

function SignalCard({ label, value, sub, tone, icon: Icon }: { label: string; value: string | number; sub: string; tone: 'red' | 'amber' | 'indigo' | 'green'; icon: ComponentType<{ size?: number; className?: string }> }) {
  const toneStyles = {
    red: 'border-red-200 bg-red-50/55 text-red-700',
    amber: 'border-amber-200 bg-amber-50/60 text-amber-700',
    indigo: 'border-indigo-200 bg-indigo-50/60 text-indigo-700',
    green: 'border-green-200 bg-green-50/60 text-green-700',
  };

  return (
    <div className={`rounded-lg border p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.045)] ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">{label}</div>
          <div className="mt-2 text-[28px] font-semibold leading-none text-slate-950">{value}</div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80">
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-2 text-[12px] leading-5 text-slate-600">{sub}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="text-[14px] font-semibold text-slate-800">{title}</div>
    </div>
  );
}

function FactorChip({ children }: { children: string }) {
  return <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{children}</span>;
}

function DepartmentRiskRow({ dept }: { dept: (typeof departments)[number] }) {
  const pct = Math.round(dept.highRisk / dept.employees * 100);
  const barClass = pct > 20 ? 'bg-red-500' : pct > 12 ? 'bg-amber-400' : 'bg-green-500';
  const textClass = pct > 20 ? 'text-red-600' : pct > 12 ? 'text-amber-600' : 'text-green-600';

  return (
    <div className="grid grid-cols-[minmax(120px,1fr)_80px_minmax(120px,220px)_56px] items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-slate-800">{dept.name}</div>
        <div className="text-[11px] text-slate-400">{dept.highRisk} high-risk of {dept.employees}</div>
      </div>
      <div className={`text-right text-[18px] font-semibold tabular-nums ${textClass}`}>{pct}%</div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, pct * 3)}%` }} />
      </div>
      <div className="flex justify-end">
        {dept.trend === 'up' ? <TrendingUp size={15} className="text-red-500" /> : dept.trend === 'down' ? <TrendingDown size={15} className="text-green-600" /> : <span className="text-[12px] text-slate-400">Stable</span>}
      </div>
    </div>
  );
}

function InterventionStatus({ status }: { status: string }) {
  return <span className={`inline-flex h-[22px] items-center rounded px-1.5 text-xs font-medium ${interventionStatusStyle[status] || ''}`}>{status}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const totalEmp = employees.length;
  const highCount = employees.filter(e => e.riskLevel === 'High').length;
  const medCount = employees.filter(e => e.riskLevel === 'Medium').length;
  const risingDepartments = departments.filter(d => d.trend === 'up').length;
  const actionRequired = recentInterventions.filter(i => i.status === 'Action Required').length;

  return (
    <AppShell breadcrumb={['Dashboard']}>
      <SectionHeader title="HR Dashboard" description="Today’s retention risks, priority reviews, and workforce signals for Sep 2026" />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard label="High-risk employees" value={highCount} sub={`${Math.round(highCount / totalEmp * 100)}% of workforce, review priority queue first`} tone="red" icon={AlertTriangle} />
        <SignalCard label="Action required today" value={actionRequired} sub="Intervention needs manager follow-up" tone="amber" icon={Clock} />
        <SignalCard label="Departments trending up" value={risingDepartments} sub="Engineering, Sales, and Marketing show rising risk" tone="indigo" icon={TrendingUp} />
        <SignalCard label="Active interventions" value={3} sub={`${medCount} medium-risk employees remain under monitoring`} tone="green" icon={CheckCircle2} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <SectionTitle title="Priority Review Queue" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed">
              <colgroup>
                <col className="w-[250px]" />
                <col className="w-[120px]" />
                <col className="w-[190px]" />
                <col className="w-[150px]" />
                <col className="w-[110px]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-4 py-2.5">Employee</th>
                  <th className="px-3 py-2.5">Risk</th>
                  <th className="px-3 py-2.5">Key factors</th>
                  <th className="px-3 py-2.5">Last analyzed</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {highRiskEmps.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => navigate(`/employees/${emp.id}`)} className="block min-w-0 text-left">
                        <div className="truncate text-[13px] font-semibold text-slate-900">{emp.name}</div>
                        <div className="truncate text-[11px] text-slate-400">{emp.department} - {emp.role}</div>
                      </button>
                    </td>
                    <td className="px-3 py-3"><RiskBadge level={emp.riskLevel} score={emp.riskScore} /></td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {getTopFactors(emp).map(factor => <FactorChip key={factor}>{factor}</FactorChip>)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-slate-500">{emp.lastAnalysis}</td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/employees/${emp.id}/risk`)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-[14px] font-semibold text-slate-800">Manager Actions</div>
            <div className="space-y-2">
              {[
                { icon: AlertTriangle, label: 'Review high-risk employees', badge: `${highCount} flagged`, color: 'text-red-500' },
                { icon: Target, label: 'Open interventions', badge: '3 active', color: 'text-indigo-500' },
                { icon: MessageSquare, label: 'Pending surveys', badge: '2 due', color: 'text-amber-500' },
                { icon: Users, label: 'Onboarding queue', badge: '4 new hires', color: 'text-green-600' },
              ].map(a => (
                <div key={a.label} className="flex min-h-11 w-full items-center gap-2.5 rounded-[5px] bg-slate-50/70 p-2.5 text-left">
                  <a.icon size={15} className={`flex-shrink-0 ${a.color}`} />
                  <span className="flex-1 text-[13px] text-slate-700">{a.label}</span>
                  <span className="text-[11px] font-medium text-slate-500">{a.badge}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <SectionTitle title="Recent Interventions" />
            <div className="divide-y divide-slate-50">
              {recentInterventions.slice(0, 3).map(r => (
                <div key={r.name} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-slate-800">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.dept}</div>
                    </div>
                    <InterventionStatus status={r.status} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={11} /> {r.date}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <SectionTitle title="Department Risk Breakdown" />
          <div>
            {topDepartments.map(dept => <DepartmentRiskRow key={dept.name} dept={dept} />)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 text-[14px] font-semibold text-slate-800">Decision Notes</div>
          <div className="space-y-3 text-[13px] leading-5 text-slate-600">
            <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2">
              Sales has the highest high-risk ratio. Review intervention coverage before the next survey cycle.
            </div>
            <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
              Employees with overtime and low satisfaction should be prioritized for manager check-ins.
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              Use the Executive Report when presenting department-level retention risk to leadership.
            </div>
          </div>
        </Card>
      </div>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
