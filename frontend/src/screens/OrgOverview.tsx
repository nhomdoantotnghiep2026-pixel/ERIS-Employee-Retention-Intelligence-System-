import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, Button, SectionHeader, AIAdvisoryBanner, Avatar, TrendIcon } from '../components/ui';
import { employees, departments, riskTrendData } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, CalendarDays, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { demoPdfContent, downloadTextFile } from '../utils/demoActions';
import { useLanguage } from '../context/LanguageContext';

const pieData = [
  { name: 'High Risk', value: 126, color: '#DC2626' },
  { name: 'Medium Risk', value: 312, color: '#D97706' },
  { name: 'Low Risk', value: 810, color: '#16A34A' },
];

const TooltipContent = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-2.5 text-xs" style={{ borderRadius: '5px' }}>
        <div className="font-medium text-gray-700 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-medium">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function OrgOverview() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const highRiskEmployees = employees.filter(e => e.riskLevel === 'High').slice(0, 5);

  return (
    <AppShell>
      <SectionHeader
        title="Organization Overview"
        description="Workforce attrition risk across departments and groups. Drill down to individual employees."
      >
        <div className="flex items-center gap-1.5 h-[32px] px-2.5 bg-white border border-gray-300 text-[13px] text-gray-600 cursor-pointer hover:bg-gray-50" style={{ borderRadius: '5px' }}>
          <CalendarDays size={13} className="text-gray-400" />
          {t('Apr – Sep 2026')}
        </div>
        <Button variant="secondary" size="sm" onClick={() => downloadTextFile('organization-overview-report.pdf', demoPdfContent('Organization Overview', 'Workforce attrition risk across departments and groups.'))}><Download size={13} /> {t('Export Report')}</Button>
      </SectionHeader>

      {/* KPI Strip */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">{t('Total Employees')}</div>
            <div className="text-[26px] font-semibold text-gray-900 leading-none">1,248</div>
            <div className="text-[12px] text-gray-400 mt-1">{t('Current workforce')}</div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">{t('High Risk')}</div>
            <div className="text-[26px] font-semibold text-red-600 leading-none">126</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-red-600 font-medium">10.1%</span>
              <span className="text-[12px] text-gray-400">{t('of workforce')}</span>
              <span className="text-[11px] text-red-500 flex items-center gap-0.5"><TrendingUp size={10} /> +0.3%</span>
            </div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">{t('Medium Risk')}</div>
            <div className="text-[26px] font-semibold text-amber-600 leading-none">312</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-amber-600 font-medium">25.0%</span>
              <span className="text-[12px] text-gray-400">{t('of workforce')}</span>
              <span className="text-[11px] text-amber-500 flex items-center gap-0.5"><TrendingUp size={10} /> +0.2%</span>
            </div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">{t('Low Risk')}</div>
            <div className="text-[26px] font-semibold text-green-600 leading-none">810</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-green-600 font-medium">64.9%</span>
              <span className="text-[12px] text-gray-400">{t('of workforce')}</span>
              <span className="text-[11px] text-green-500 flex items-center gap-0.5"><TrendingDown size={10} /> -0.5%</span>
            </div>
          </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[14px] font-medium text-gray-800">{t('Attrition Risk Trend')}</div>
              <div className="text-[12px] text-gray-500">{t('6-month predicted risk distribution (%)')}</div>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter' }} />
                <Tooltip content={<TooltipContent />} />
                <Line type="monotone" dataKey="high" stroke="#DC2626" strokeWidth={1.5} dot={false} name={t('High Risk')} />
                <Line type="monotone" dataKey="medium" stroke="#D97706" strokeWidth={1.5} dot={false} name={t('Medium Risk')} />
                <Line type="monotone" dataKey="low" stroke="#16A34A" strokeWidth={1.5} dot={false} name={t('Low Risk')} />
                <Legend iconType="plainline" iconSize={16} formatter={(v) => <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter' }}>{v}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">{t('Risk Distribution')}</div>
          <div className="text-[12px] text-gray-500 mb-2">{t('Current workforce breakdown')}</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={1} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} ${t('Employees').toLowerCase()}`, t(String(n))]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter' }}>{t(String(v))}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Risk Table */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[14px] font-medium text-gray-800">{t('Department Risk Overview')}</span>
            <span className="text-[12px] text-gray-400 ml-2">{t('Attrition risk summary by department')}</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {departments.map(d => {
            const medium = Math.round(d.employees * 0.25);
            const low = d.employees - d.highRisk - medium;
            return (
              <div key={d.name} className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{t(d.name)}</span>
                  <span className="shrink-0 text-xs font-medium text-slate-500">{d.employees} {t('Employees').toLowerCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-red-50 px-2 py-2"><div className="text-xs text-red-600">{t('High Risk')}</div><div className="mt-0.5 font-semibold text-red-700">{d.highRisk}</div></div>
                  <div className="rounded-xl bg-amber-50 px-2 py-2"><div className="text-xs text-amber-600">{t('Medium Risk')}</div><div className="mt-0.5 font-semibold text-amber-700">{medium}</div></div>
                  <div className="rounded-xl bg-emerald-50 px-2 py-2"><div className="text-xs text-emerald-600">{t('Low Risk')}</div><div className="mt-0.5 font-semibold text-emerald-700">{low}</div></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full min-w-[760px] table-fixed">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Department', 'Employees', 'High Risk', 'Medium Risk', 'Low Risk', 'Avg Risk', 'Trend'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map(d => {
              const medium = Math.round(d.employees * 0.25);
              const low = d.employees - d.highRisk - medium;
              return (
                <tr key={d.name} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3 h-[40px] text-[13px] font-medium text-gray-800">{t(d.name)}</td>
                  <td className="px-3 h-[40px] text-[13px] text-gray-600">{d.employees}</td>
                  <td className="px-3 h-[40px] text-[13px]">
                    <span className="text-red-600 font-medium">{d.highRisk}</span>
                    <span className="text-gray-400 text-[12px] ml-1">({Math.round(d.highRisk / d.employees * 100)}%)</span>
                  </td>
                  <td className="px-3 h-[40px] text-[13px]"><span className="text-amber-600">{medium}</span></td>
                  <td className="px-3 h-[40px] text-[13px]"><span className="text-green-600">{low}</span></td>
                  <td className="px-3 h-[40px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.avgRisk >= 50 ? 'bg-red-400' : d.avgRisk >= 35 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${d.avgRisk}%` }} />
                      </div>
                      <span className="text-[12px] text-gray-600">{d.avgRisk}%</span>
                    </div>
                  </td>
                  <td className="px-3 h-[40px]"><TrendIcon trend={d.trend} /></td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </Card>

      {/* Employees Requiring Attention */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[14px] font-medium text-gray-800">{t('Employees Requiring Attention')}</span>
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {highRiskEmployees.map(emp => (
            <button
              key={emp.id}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-orange-50/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-500"
              onClick={() => navigate(`/employees/${emp.id}/risk`, { state: { returnTo: '/org-overview' } })}
            >
              <Avatar initials={emp.initials} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">{emp.name}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{t(emp.role)} · {t(emp.department)}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2"><RiskBadge level={emp.riskLevel} /><span className="font-mono text-xs font-bold text-red-600">{emp.riskScore}%</span><span className="text-xs text-slate-400">{emp.lastAnalysis}</span></span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
        <div className="hidden overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full min-w-[980px] table-fixed">
          <colgroup>
            <col className="w-[190px]" />
            <col className="w-[130px]" />
            <col className="w-[160px]" />
            <col className="w-[120px]" />
            <col className="w-[80px]" />
            <col className="w-[120px]" />
            <col className="w-[110px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Role', 'Risk', 'Score', 'Top Factor', 'Last Analysis', 'Action'].map(h => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {highRiskEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 py-2.5 align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar initials={emp.initials} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-gray-800" title={emp.name}>{emp.name}</div>
                      <div className="text-[11px] text-gray-400">{emp.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle text-[13px] text-gray-600">{t(emp.department)}</td>
                <td className="px-3 py-2.5 align-middle text-[13px] leading-5 text-gray-600">{t(emp.role)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 align-middle"><RiskBadge level={emp.riskLevel} /></td>
                <td className="whitespace-nowrap px-3 py-2.5 align-middle"><span className="text-[13px] font-semibold text-red-600">{emp.riskScore}%</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 align-middle text-[13px] text-gray-600">{t('Overtime')}</td>
                <td className="whitespace-nowrap px-3 py-2.5 align-middle text-[12px] text-gray-400">{emp.lastAnalysis}</td>
                <td className="px-3 py-2.5 align-middle">
                  <button className="whitespace-nowrap text-[13px] font-medium text-[#F97316] hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp.id}/risk`, { state: { returnTo: '/org-overview' } }); }}>
                    {t('View analysis')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </Card>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
