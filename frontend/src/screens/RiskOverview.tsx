import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, AIAdvisoryBanner, RiskBadge } from '../components/ui';
import { departments, riskTrendData, orgFactors, highRiskGroups } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleRiskData = [
  { role: 'Sales Rep', high: 42 }, { role: 'Engineer', high: 28 },
  { role: 'Marketing', high: 35 }, { role: 'Analyst', high: 18 }, { role: 'Manager', high: 12 },
];

export default function RiskOverview() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb={['Workforce Risk']}>
      <SectionHeader title="Workforce Risk" description="Attrition risk distribution across departments, groups, and the organization." />

      {/* Metrics row */}
      <Card className="mb-4">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          {[
            { label: 'Organization Risk', value: '34.2%', sub: 'Weighted avg. score', color: 'text-amber-600' },
            { label: 'High-Risk Employees', value: '126', sub: '10.1% of workforce', color: 'text-red-600' },
            { label: 'Departments Monitored', value: '6', sub: 'All active departments', color: 'text-gray-900' },
            { label: 'Risk Change (30d)', value: '+1.4%', sub: 'vs. previous month', color: 'text-red-500' },
          ].map(m => (
            <div key={m.label} className="px-5 py-4">
              <div className="text-[12px] text-gray-500 mb-1">{m.label}</div>
              <div className={`text-[26px] font-semibold leading-none mb-0.5 ${m.color}`}>{m.value}</div>
              <div className="text-[12px] text-gray-400">{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">High Risk by Department</div>
          <div className="text-[12px] text-gray-400 mb-3">Number of high-risk employees per department</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} layout="vertical" margin={{ left: 56, right: 16 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#4B5563' }} width={50} />
                <Tooltip />
                <Bar dataKey="highRisk" name="High Risk" fill="#DC2626" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">Risk Trend (6 months)</div>
          <div className="text-[12px] text-gray-400 mb-3">Monthly risk percentage over time</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ right: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip />
                <Line type="monotone" dataKey="high" stroke="#DC2626" strokeWidth={1.5} dot={false} name="High %" />
                <Line type="monotone" dataKey="medium" stroke="#D97706" strokeWidth={1.5} dot={false} name="Medium %" />
                <Legend iconType="plainline" iconSize={14} formatter={(v) => <span style={{ fontSize: 11, color: '#6B7280' }}>{v}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Factors */}
      <Card className="mb-4 p-4">
        <div className="text-[14px] font-medium text-gray-800 mb-1">Top Contributing Factors — Organization</div>
        <div className="text-[12px] text-gray-400 mb-3">Prevalence of each factor across high-risk employee cases</div>
        <div className="space-y-2.5">
          {orgFactors.map(f => (
            <div key={f.factor} className="flex items-center gap-3">
              <span className="w-40 text-[13px] text-gray-700 flex-shrink-0">{f.factor}</span>
              <div className="flex-1 bg-gray-100 h-2 rounded overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded" style={{ width: `${f.pct}%` }} />
              </div>
              <span className="text-[12px] font-semibold text-[#2563EB] w-8 text-right flex-shrink-0">{f.pct}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* High-Risk Groups */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200">
          <div className="text-[14px] font-medium text-gray-800">High-Risk Groups</div>
          <div className="text-[12px] text-gray-400 mt-0.5">Groups with elevated attrition risk patterns</div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Group', 'Employees', 'High Risk', 'Avg Risk', 'Main Factor', 'Trend', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {highRiskGroups.map(g => (
              <tr key={g.group} className="hover:bg-gray-50/60">
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{g.group}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{g.employees}</td>
                <td className="px-3 h-[44px]">
                  <span className="text-[13px] font-semibold text-red-600">{g.highRisk}</span>
                  <span className="text-[12px] text-gray-400 ml-1">({Math.round(g.highRisk / g.employees * 100)}%)</span>
                </td>
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-700">{g.avgRisk}%</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{g.mainFactor}</td>
                <td className="px-3 h-[44px]">
                  {g.trend === 'up' && <span className="text-[12px] text-red-500 flex items-center gap-1"><TrendingUp size={11} /> Rising</span>}
                  {g.trend === 'down' && <span className="text-[12px] text-green-600 flex items-center gap-1"><TrendingDown size={11} /> Falling</span>}
                  {g.trend === 'stable' && <span className="text-[12px] text-gray-400 flex items-center gap-1"><Minus size={11} /> Stable</span>}
                </td>
                <td className="px-3 h-[44px]">
                  <button className="text-[13px] text-[#2563EB] hover:underline" onClick={() => navigate('/employees')}>
                    View Employees
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
