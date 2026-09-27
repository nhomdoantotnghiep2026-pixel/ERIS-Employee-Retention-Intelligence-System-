import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, AIAdvisoryBanner, Avatar, Button } from '../components/ui';
import { employees, contributingFactors } from '../data/mockData';
import { useState } from 'react';
import { BrainCircuit, ClipboardList, MessageSquare, Sparkles } from 'lucide-react';

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-[12px] text-gray-400">{label}</span>
      <span className={`text-[13px] font-medium ${highlight ? 'text-amber-600' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

export default function RiskAnalysis() {
  const { id } = useParams();
  const emp = employees.find(e => e.id === id) || employees[0];
  const maxFactor = Math.max(...contributingFactors.map(f => f.value));
  const [copilotOpen, setCopilotOpen] = useState(false);
  const localExplanations = [
    { factor: 'Overtime', value: emp.overtime ? 0.24 : 0.04, impact: emp.overtime ? 'Increases risk' : 'Low impact', note: emp.overtime ? 'Employee is currently marked for overtime.' : 'No overtime signal detected.' },
    { factor: 'Job Satisfaction', value: emp.jobSatisfaction <= 2 ? 0.21 : 0.07, impact: emp.jobSatisfaction <= 2 ? 'Increases risk' : 'Protective', note: `Current score: ${emp.jobSatisfaction}/5.` },
    { factor: 'Work-Life Balance', value: emp.workLifeBalance <= 2 ? 0.16 : 0.05, impact: emp.workLifeBalance <= 2 ? 'Increases risk' : 'Protective', note: `Current score: ${emp.workLifeBalance}/4.` },
    { factor: 'Business Travel', value: emp.businessTravel === 'Frequently' ? 0.12 : 0.03, impact: emp.businessTravel === 'Frequently' ? 'Increases risk' : 'Low impact', note: `Travel pattern: ${emp.businessTravel}.` },
  ].sort((a, b) => b.value - a.value);
  const copilotSuggestions = [
    emp.overtime ? 'Schedule a workload review with the employee and direct manager.' : 'Confirm whether workload remains stable in the next check-in.',
    emp.jobSatisfaction <= 2 ? 'Prepare a 1-on-1 discussion focused on satisfaction drivers and career blockers.' : 'Maintain regular engagement check-ins.',
    emp.workLifeBalance <= 2 ? 'Offer flexible scheduling or redistribution of urgent tasks for two weeks.' : 'Monitor work-life balance trend in the next pulse survey.',
    emp.monthlyIncome < 4500 ? 'Flag compensation review as a possible retention lever.' : 'Compensation is not the strongest current signal.',
  ];

  return (
    <AppShell breadcrumb={['Employees', emp.name, 'Risk Analysis']}>
      {/* Header */}
      <Card className="mb-4 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={emp.initials} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-semibold text-gray-900">{emp.name}</span>
                <RiskBadge level={emp.riskLevel} score={emp.riskScore} />
              </div>
              <div className="text-[13px] text-gray-500">{emp.role} · {emp.department}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Last analyzed</div>
            <div className="text-[13px] font-medium text-gray-700">{emp.lastAnalysis}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="col-span-2 space-y-4">
          {/* Risk Score */}
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Predicted Attrition Risk</div>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                <div className={`text-[40px] font-bold leading-none ${emp.riskLevel === 'High' ? 'text-red-600' : emp.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {emp.riskScore}%
                </div>
                <div className="mt-1"><RiskBadge level={emp.riskLevel} /></div>
              </div>
              <div className="flex-1 pt-2">
                {/* Horizontal risk meter */}
                <div className="relative mb-1">
                  <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-green-100" />
                    <div className="flex-1 bg-amber-100" />
                    <div className="flex-1 bg-red-100" />
                  </div>
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow ${emp.riskLevel === 'High' ? 'bg-red-500' : emp.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ left: `calc(${emp.riskScore}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-3">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  The model indicates an elevated attrition risk. Overtime, job satisfaction, and years at the company are among the strongest factors associated with this prediction.
                </p>
                <div className="flex gap-5 mt-2">
                  <div>
                    <div className="text-[11px] text-gray-400">Model Version</div>
                    <div className="text-[12px] font-medium text-gray-700">Attrition Model v2.3</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400">Data Status</div>
                    <div className="text-[12px] font-medium text-green-600">Validated</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contributing Factors */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[14px] font-semibold text-gray-800 mb-1">Key Contributing Factors</div>
                <div className="text-[12px] text-gray-400">Global factors influencing attrition predictions</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
                <BrainCircuit size={12} /> SHAP explainability
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3 text-[12px] text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-300" /> Increasing predicted risk</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-300" /> Reducing predicted risk</div>
            </div>
            <div className="space-y-2.5">
              {contributingFactors.map(f => (
                <div key={f.factor} className="flex items-center gap-2.5">
                  <span className="w-44 text-[13px] text-gray-700 flex-shrink-0">{f.factor}</span>
                  <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
                    <div
                      className={`h-full rounded ${f.direction === 'increase' ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ width: `${(f.value / maxFactor) * 100}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold w-10 text-right flex-shrink-0 ${f.direction === 'increase' ? 'text-red-600' : 'text-green-600'}`}>
                    {f.direction === 'increase' ? '+' : '-'}{f.value}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
              Factor contributions represent relative associations derived from explainability analysis, not causal relationships.
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-gray-800">Local SHAP Explanation</div>
                <div className="text-[12px] text-gray-400">Employee-specific drivers behind this risk score</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setCopilotOpen(open => !open)}>
                <Sparkles size={13} /> {copilotOpen ? 'Hide Copilot' : 'Suggest Intervention'}
              </Button>
            </div>
            <div className="space-y-2.5">
              {localExplanations.map(item => (
                <div key={item.factor} className="grid grid-cols-[150px_minmax(0,1fr)_120px] items-center gap-3">
                  <div className="text-[13px] font-medium text-slate-700">{item.factor}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.impact === 'Protective' ? 'bg-emerald-500' : item.impact === 'Low impact' ? 'bg-slate-300' : 'bg-red-400'}`} style={{ width: `${Math.min(100, item.value * 420)}%` }} />
                  </div>
                  <div className={`text-right text-[12px] font-semibold ${item.impact === 'Protective' ? 'text-emerald-600' : item.impact === 'Low impact' ? 'text-slate-500' : 'text-red-600'}`}>{item.impact}</div>
                  <div className="col-span-3 -mt-1 text-[11px] text-slate-400">{item.note}</div>
                </div>
              ))}
            </div>
            {copilotOpen && (
              <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-indigo-800">
                  <MessageSquare size={14} /> HR Copilot Intervention Draft
                </div>
                <div className="space-y-2">
                  {copilotSuggestions.map(suggestion => (
                    <div key={suggestion} className="flex gap-2 text-[13px] leading-5 text-slate-700">
                      <ClipboardList size={13} className="mt-1 flex-shrink-0 text-indigo-500" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-slate-500">Copilot output is advisory. HR must review before creating an intervention.</div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Employee Snapshot</div>
            <InfoRow label="Department" value={emp.department} />
            <InfoRow label="Role" value={emp.role} />
            <InfoRow label="Tenure" value={`${emp.tenure} years`} />
            <InfoRow label="Overtime" value={emp.overtime ? 'Yes' : 'No'} highlight={emp.overtime} />
            <InfoRow label="Job Satisfaction" value={`${emp.jobSatisfaction} / 5`} highlight={emp.jobSatisfaction <= 2} />
            <InfoRow label="Work-Life Balance" value={`${emp.workLifeBalance} / 4`} highlight={emp.workLifeBalance <= 2} />
            <InfoRow label="Monthly Income" value={`$${emp.monthlyIncome.toLocaleString()}`} />
            <InfoRow label="Business Travel" value={emp.businessTravel} />
          </Card>
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-gray-800 mb-3">Analysis Information</div>
            <InfoRow label="Model Version" value="Attrition Model v2.3" />
            <InfoRow label="Analysis Date" value={emp.lastAnalysis} />
            <InfoRow label="Data Status" value="Validated" />
            <InfoRow label="Dataset" value="2026-Q3" />
            <InfoRow label="Human Review" value="Required" highlight />
            <InfoRow label="Decision Mode" value="Advisory only" />
          </Card>
        </div>
      </div>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
