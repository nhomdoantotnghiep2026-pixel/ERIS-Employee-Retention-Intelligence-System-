import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, Button, Tabs, Avatar, AIAdvisoryBanner } from '../components/ui';
import { employees } from '../data/mockData';
import { useState } from 'react';
import { ArrowRight, Calendar, FileText, ArrowUpCircle, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function InfoRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-[13px] text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-[13px] text-gray-800 font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

type InterventionStatus = 'In Progress' | 'Action Required' | 'Resolved';

const interventionStatusStyles: Record<InterventionStatus, string> = {
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Action Required': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Resolved': 'bg-green-50 text-green-700 border border-green-200',
};

const workforceTimeline = [
  { date: 'Sep 2026', type: 'Risk Flagged', detail: 'Attrition risk escalated to High (78%)', icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-200' },
  { date: 'Jul 2026', type: 'Performance Review', detail: 'Annual review: Meets Expectations. No raise approved.', icon: FileText, color: 'text-slate-500 bg-slate-50 border-slate-200' },
  { date: 'Mar 2026', type: 'Overtime Increase', detail: 'Overtime hours increased from avg 4h/wk to 11h/wk', icon: TrendingUp, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { date: 'Jan 2026', type: 'Job Level Change', detail: 'Promoted from Level 1 to Level 2', icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-200' },
  { date: 'Sep 2025', type: 'Salary Adjustment', detail: 'Salary adjusted from $5,200 to $5,800/mo (+11.5%)', icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-200' },
  { date: 'Mar 2024', type: 'Hired', detail: 'Joined Engineering as Software Engineer', icon: CheckCircle, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
];

const surveyBreakdown = [
  { category: 'Job Satisfaction', score: 2, max: 5, label: 'Well below average', color: 'bg-red-400' },
  { category: 'Work-Life Balance', score: 1, max: 4, label: 'Critical concern', color: 'bg-red-500' },
  { category: 'Environment Satisfaction', score: 3, max: 5, label: 'Below average', color: 'bg-amber-400' },
  { category: 'Manager Relationship', score: 2, max: 5, label: 'Well below average', color: 'bg-red-400' },
  { category: 'Career Growth Outlook', score: 2, max: 5, label: 'Well below average', color: 'bg-red-400' },
];

function ScoreGrid({ score, max, color }: { score: number; max: number; color: string }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-6 h-6 rounded-[3px] flex items-center justify-center text-[11px] font-semibold ${i < score ? `${color} text-white` : 'bg-slate-100 text-slate-300'}`}>
          {i + 1}
        </div>
      ))}
      <span className="text-[12px] text-slate-400 ml-1 font-mono">{score}/{max}</span>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [actionMessage, setActionMessage] = useState('');
  const emp = employees.find(e => e.id === id) || employees[0];

  const interventionStatus: InterventionStatus = emp.riskLevel === 'High' ? 'Action Required' : emp.riskLevel === 'Medium' ? 'In Progress' : 'Resolved';

  return (
    <AppShell breadcrumb={['Employees', emp.name]}>
      {/* Profile Header */}
      <Card className="mb-4 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={emp.initials} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-semibold text-gray-900">{emp.name}</h1>
                <RiskBadge level={emp.riskLevel} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[13px] text-gray-500">
                <span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded">{emp.employeeId}</span>
                <span>·</span><span>{emp.department}</span>
                <span>·</span><span>{emp.role}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-gray-400">Last analyzed</div>
            <div className="text-[13px] font-medium text-gray-700">{emp.lastAnalysis}</div>
          </div>
        </div>
      </Card>

      <Tabs tabs={['Overview', 'Retention Interventions', 'Workforce Timeline', 'Survey Breakdown', 'Employment Data', 'Analysis History']} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-3">Employment Information</div>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <InfoRow label="Department" value={emp.department} />
                <InfoRow label="Job Role" value={emp.role} />
                <InfoRow label="Age" value={`${emp.age} years`} />
                <InfoRow label="Tenure" value={`${emp.tenure} years`} />
                <InfoRow label="Business Travel" value={emp.businessTravel} />
                <InfoRow label="Overtime" value={emp.overtime ? 'Yes' : 'No'} valueClass={emp.overtime ? 'text-amber-600' : ''} />
                <InfoRow label="Monthly Income" value={`$${emp.monthlyIncome.toLocaleString()}`} />
                <InfoRow label="Job Level" value={`Level ${emp.jobLevel}`} />
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-3">Satisfaction Indicators</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { label: 'Job Satisfaction', value: emp.jobSatisfaction, max: 5 },
                  { label: 'Environment Satisfaction', value: emp.environmentSatisfaction, max: 4 },
                  { label: 'Work-Life Balance', value: emp.workLifeBalance, max: 4 },
                ].map(s => (
                  <div key={s.label} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div className="mb-2 text-[12px] font-medium text-slate-600">{s.label}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: s.max }, (_, i) => (
                        <div key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-medium ${i < s.value ? 'bg-[#4F46E5] text-white' : 'bg-white text-slate-300'}`}>
                          {i + 1}
                        </div>
                      ))}
                      <span className="text-[12px] text-gray-400 ml-1.5">{s.value}/{s.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-3">Predicted Attrition Risk</div>
              <div className="text-center py-3">
                <div className={`text-[36px] font-bold leading-none mb-2 ${emp.riskLevel === 'High' ? 'text-red-600' : emp.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {emp.riskScore}%
                </div>
                <RiskBadge level={emp.riskLevel} />
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${emp.riskLevel === 'High' ? 'bg-red-500' : emp.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${emp.riskScore}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[12px] text-gray-400 mb-2">Last analyzed: {emp.lastAnalysis}</div>
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => navigate(`/employees/${emp.id}/risk`)}>
                  View Risk Analysis <ArrowRight size={12} />
                </Button>
              </div>
            </Card>

            {/* Intervention summary */}
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-gray-800 mb-2">Intervention Status</div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[12px] font-semibold ${interventionStatusStyles[interventionStatus]}`}>
                {interventionStatus === 'Action Required' ? <AlertCircle size={12} /> : interventionStatus === 'In Progress' ? <Clock size={12} /> : <CheckCircle size={12} />}
                {interventionStatus}
              </span>
              <div className="mt-3 space-y-1.5">
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => setTab('Retention Interventions')}>
                  <Calendar size={12} /> Schedule 1-on-1 Meeting
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => setTab('Retention Interventions')}>
                  <FileText size={12} /> Create Action Plan
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => { setActionMessage('Escalation sent to HR Manager.'); setTab('Retention Interventions'); }}>
                  <ArrowUpCircle size={12} /> Escalate to HR Manager
                </Button>
                {actionMessage && <div className="mt-2 rounded bg-indigo-50 px-2 py-1.5 text-[12px] text-indigo-700">{actionMessage}</div>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Retention Interventions' && (
        <div className="space-y-4">
          {/* Intervention Panel */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">Retention Intervention Panel</div>
                <div className="text-[13px] text-slate-500 mt-0.5">{emp.name} · {emp.department}</div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold ${interventionStatusStyles[interventionStatus]}`}>
                {interventionStatus === 'Action Required' ? <AlertCircle size={12} /> : interventionStatus === 'In Progress' ? <Clock size={12} /> : <CheckCircle size={12} />}
                {interventionStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Assigned HR', value: 'Le Thi Manager' },
                { label: 'Intervention Type', value: '1-on-1 Meeting + Action Plan' },
                { label: 'Next Review', value: 'Sep 28, 2026' },
              ].map(row => (
                <div key={row.label} className="bg-slate-50 rounded-[5px] p-3">
                  <div className="text-[11px] text-slate-400 mb-0.5">{row.label}</div>
                  <div className="text-[13px] font-medium text-slate-800">{row.value}</div>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="text-[12px] font-medium text-slate-500 mb-1.5">Latest Notes</div>
              <div className="bg-slate-50 rounded-[5px] p-3 text-[13px] text-slate-700">
                Sep 20, 2026 — Discussed concerns around consistent overtime and workload distribution. Employee expressed interest in mentorship program. Follow-up 1-on-1 scheduled for Sep 28.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setActionMessage('1-on-1 meeting scheduled for the next available HR slot.')}>
                <Calendar size={13} /> Schedule 1-on-1 Meeting
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActionMessage('Retention action plan created and attached to this employee profile.')}>
                <FileText size={13} /> Create Retention Action Plan
              </Button>
              <Button variant="secondary" size="sm" className="ml-auto" onClick={() => setActionMessage('Escalation sent to HR Manager.')}>
                <ArrowUpCircle size={13} /> Escalate to HR Manager
              </Button>
            </div>
            {actionMessage && <div className="mt-3 rounded bg-indigo-50 px-3 py-2 text-[12px] text-indigo-700">{actionMessage}</div>}
          </Card>

          {/* Intervention History */}
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 text-[14px] font-semibold text-slate-800">Intervention History</div>
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[38%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Date', 'Type', 'Conducted By', 'Outcome', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { date: 'Sep 20, 2026', type: '1-on-1', by: 'Le Thi Manager', outcome: 'In Progress', note: 'Workload discussion; follow-up scheduled' },
                  { date: 'Aug 5, 2026', type: 'Check-in', by: 'Le Thi Manager', outcome: 'Resolved', note: 'Addressed work-life balance concerns' },
                ].map(row => (
                  <tr key={row.date} className="hover:bg-slate-50/60">
                    <td className="px-4 h-[44px] text-[13px] text-slate-600">{row.date}</td>
                    <td className="px-4 h-[44px] text-[13px] text-slate-700">{row.type}</td>
                    <td className="px-4 h-[44px] text-[13px] text-slate-700">{row.by}</td>
                    <td className="px-4 h-[44px]">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium h-[20px] ${interventionStatusStyles[row.outcome as InterventionStatus] || ''}`}>
                        {row.outcome}
                      </span>
                    </td>
                    <td className="px-4 h-[44px] text-[12px] text-slate-500">
                      <span className="line-clamp-2">{row.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'Workforce Timeline' && (
        <Card className="p-5">
          <div className="text-[14px] font-semibold text-slate-800 mb-4">Career & Workforce History</div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {workforceTimeline.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${event.color}`}>
                      <Icon size={11} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-mono text-slate-400">{event.date}</div>
                      <div className="mt-1 text-[13px] font-semibold text-slate-800">{event.type}</div>
                      <div className="mt-0.5 text-[13px] leading-5 text-slate-500">{event.detail}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {tab === 'Survey Breakdown' && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-[14px] font-semibold text-slate-800 mb-1">Survey Score Breakdown</div>
            <div className="text-[13px] text-slate-500 mb-4">Last survey: Q3 2026 · Sep 10, 2026</div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {surveyBreakdown.map(s => (
                <div key={s.category} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[13px] font-medium text-slate-700">{s.category}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${s.score <= 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{s.label}</span>
                  </div>
                  <ScoreGrid score={s.score} max={s.max} color={s.color} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[14px] font-semibold text-slate-800 mb-3">Quarter-over-Quarter Comparison</div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Metric', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Change'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { metric: 'Job Satisfaction', q1: '4/5', q2: '3/5', q3: '2/5', change: -2 },
                  { metric: 'Work-Life Balance', q1: '3/4', q2: '2/4', q3: '1/4', change: -2 },
                  { metric: 'Environment Satisfaction', q1: '4/5', q2: '3/5', q3: '3/5', change: -1 },
                  { metric: 'Manager Relationship', q1: '4/5', q2: '3/5', q3: '2/5', change: -2 },
                ].map(row => (
                  <tr key={row.metric} className="hover:bg-slate-50/60">
                    <td className="px-3 h-[44px] text-[13px] text-slate-700">{row.metric}</td>
                    <td className="px-3 h-[44px] font-mono text-[13px] text-slate-600">{row.q1}</td>
                    <td className="px-3 h-[44px] font-mono text-[13px] text-slate-600">{row.q2}</td>
                    <td className="px-3 h-[44px] font-mono text-[13px] font-semibold text-red-600">{row.q3}</td>
                    <td className="px-3 h-[44px]">
                      <span className="flex items-center gap-1 text-[12px] text-red-500 font-medium">
                        <TrendingDown size={12} /> {row.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'Employment Data' && (
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-gray-800 mb-3">Employment Details</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Employee ID', emp.employeeId], ['Status', emp.status], ['Department', emp.department],
              ['Job Role', emp.role], ['Job Level', `Level ${emp.jobLevel}`], ['Age', `${emp.age}`],
              ['Tenure', `${emp.tenure} yr`], ['Monthly Income', `$${emp.monthlyIncome.toLocaleString()}`],
              ['Business Travel', emp.businessTravel], ['Overtime', emp.overtime ? 'Yes' : 'No'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-400">{label}</div>
                <div className="mt-1 truncate text-[13px] font-semibold text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'Analysis History' && (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Date', 'Model Version', 'Risk Score', 'Risk Level', 'Data Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { date: 'Sep 22, 2026', model: 'v2.3', score: emp.riskScore },
                { date: 'Jun 15, 2026', model: 'v2.2', score: Math.max(10, emp.riskScore - 8) },
                { date: 'Mar 10, 2026', model: 'v2.1', score: Math.max(10, emp.riskScore - 14) },
              ].map(h => (
                <tr key={h.date} className="hover:bg-gray-50/60">
                  <td className="px-3 h-[44px] text-[13px] text-gray-700">{h.date}</td>
                  <td className="px-3 h-[44px] font-mono text-[12px] text-gray-500">{h.model}</td>
                  <td className="px-3 h-[44px] text-[13px] font-semibold text-gray-800">{h.score}%</td>
                  <td className="px-3 h-[44px]"><RiskBadge level={emp.riskLevel} /></td>
                  <td className="px-3 h-[44px] text-[13px] text-green-600">Validated</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
