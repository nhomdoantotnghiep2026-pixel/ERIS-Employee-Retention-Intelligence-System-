import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, Button, SectionHeader, AIAdvisoryBanner, Avatar, TrendIcon } from '../components/ui';
import { employees, departments, riskTrendData } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { demoPdfContent, downloadTextFile } from '../utils/demoActions';

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

export default function Overview() {
  const navigate = useNavigate();
  const highRiskEmployees = employees.filter(e => e.riskLevel === 'High').slice(0, 5);

  return (
    <AppShell>
      <SectionHeader
        title="Overview"
        description="Monitor workforce attrition risk and identify areas requiring HR review."
      >
        <div className="flex items-center gap-1.5 h-[32px] px-2.5 bg-white border border-gray-300 text-[13px] text-gray-600 cursor-pointer hover:bg-gray-50" style={{ borderRadius: '5px' }}>
          <CalendarDays size={13} className="text-gray-400" />
          Apr – Sep 2026
        </div>
        <Button variant="secondary" size="sm" onClick={() => downloadTextFile('workforce-overview-report.pdf', demoPdfContent('Overview', 'Workforce attrition risk and HR review summary.'))}><Download size={13} /> Export Report</Button>
      </SectionHeader>

      {/* KPI Strip */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Total Employees</div>
            <div className="text-[26px] font-semibold text-gray-900 leading-none">1,248</div>
            <div className="text-[12px] text-gray-400 mt-1">Current workforce</div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">High Risk</div>
            <div className="text-[26px] font-semibold text-red-600 leading-none">126</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-red-600 font-medium">10.1%</span>
              <span className="text-[12px] text-gray-400">of workforce</span>
              <span className="text-[11px] text-red-500 flex items-center gap-0.5"><TrendingUp size={10} /> +0.3%</span>
            </div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Medium Risk</div>
            <div className="text-[26px] font-semibold text-amber-600 leading-none">312</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-amber-600 font-medium">25.0%</span>
              <span className="text-[12px] text-gray-400">of workforce</span>
              <span className="text-[11px] text-amber-500 flex items-center gap-0.5"><TrendingUp size={10} /> +0.2%</span>
            </div>
          </Card>
          <Card className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Low Risk</div>
            <div className="text-[26px] font-semibold text-green-600 leading-none">810</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-green-600 font-medium">64.9%</span>
              <span className="text-[12px] text-gray-400">of workforce</span>
              <span className="text-[11px] text-green-500 flex items-center gap-0.5"><TrendingDown size={10} /> -0.5%</span>
            </div>
          </Card>
      </div>

      {/* Charts Row — trend left (wider), donut right (narrower) */}
      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[14px] font-medium text-gray-800">Attrition Risk Trend</div>
              <div className="text-[12px] text-gray-500">6-month predicted risk distribution (%)</div>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Roboto' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Roboto' }} />
                <Tooltip content={<TooltipContent />} />
                <Line type="monotone" dataKey="high" stroke="#DC2626" strokeWidth={1.5} dot={false} name="High Risk" />
                <Line type="monotone" dataKey="medium" stroke="#D97706" strokeWidth={1.5} dot={false} name="Medium Risk" />
                <Line type="monotone" dataKey="low" stroke="#16A34A" strokeWidth={1.5} dot={false} name="Low Risk" />
                <Legend iconType="plainline" iconSize={16} formatter={(v) => <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Roboto' }}>{v}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">Risk Distribution</div>
          <div className="text-[12px] text-gray-500 mb-2">Current workforce breakdown</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={1} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} employees`, n]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Roboto' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Risk Table */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[14px] font-medium text-gray-800">Department Risk Overview</span>
            <span className="text-[12px] text-gray-400 ml-2">Attrition risk summary by department</span>
          </div>
        </div>
        <table className="w-full table-fixed">
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
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map(d => {
              const medium = Math.round(d.employees * 0.25);
              const low = d.employees - d.highRisk - medium;
              return (
                <tr key={d.name} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3 h-[40px] text-[13px] font-medium text-gray-800">{d.name}</td>
                  <td className="px-3 h-[40px] text-[13px] text-gray-600">{d.employees}</td>
                  <td className="px-3 h-[40px] text-[13px]">
                    <span className="text-red-600 font-medium">{d.highRisk}</span>
                    <span className="text-gray-400 text-[12px] ml-1">({Math.round(d.highRisk / d.employees * 100)}%)</span>
                  </td>
                  <td className="px-3 h-[40px] text-[13px]">
                    <span className="text-amber-600">{medium}</span>
                  </td>
                  <td className="px-3 h-[40px] text-[13px]">
                    <span className="text-green-600">{low}</span>
                  </td>
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
      </Card>

      {/* Employees Requiring Attention */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[14px] font-medium text-gray-800">Employees Requiring Attention</span>
        </div>
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[21%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Role', 'Risk', 'Score', 'Top Factor', 'Last Analysis', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {highRiskEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.initials} size="sm" />
                    <div>
                      <div className="text-[13px] font-medium text-gray-800">{emp.name}</div>
                      <div className="text-[11px] text-gray-400">{emp.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{emp.department}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{emp.role}</td>
                <td className="px-3 h-[44px]"><RiskBadge level={emp.riskLevel} /></td>
                <td className="px-3 h-[44px]"><span className="text-[13px] font-semibold text-red-600">{emp.riskScore}%</span></td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">Overtime</td>
                <td className="px-3 h-[44px] text-[12px] text-gray-400">{emp.lastAnalysis}</td>
                <td className="px-3 h-[44px]">
                  <button className="text-[13px] text-[#2563EB] hover:underline" onClick={() => navigate(`/employees/${emp.id}/risk`)}>
                    View analysis
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
