import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, SectionHeader, Avatar, AIAdvisoryBanner } from '../components/ui';
import { employees, contributingFactors } from '../data/mockData';
import { Search, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

type Filter = 'All' | 'High' | 'Medium' | 'Low';

const topFactor = (empId: string) => {
  // Use first contributing factor as the "top" factor for each employee (mock)
  const factors = ['Overtime', 'Job Satisfaction', 'Work-Life Balance', 'Years at Company', 'Business Travel'];
  const idx = parseInt(empId.replace(/\D/g, ''), 10) % factors.length;
  return factors[idx] || contributingFactors[0]?.factor || 'Overtime';
};

const analysisHistory = [
  { date: 'Sep 15, 2026', version: 'v2.3', change: 'Increased' },
  { date: 'Aug 15, 2026', version: 'v2.3', change: 'No change' },
  { date: 'Jul 15, 2026', version: 'v2.2', change: 'Decreased' },
];

export default function StaffRiskAnalysis() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const filtered = employees.filter(e => {
    const matchRisk = filter === 'All' || e.riskLevel === filter;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const counts = {
    All: employees.length,
    High: employees.filter(e => e.riskLevel === 'High').length,
    Medium: employees.filter(e => e.riskLevel === 'Medium').length,
    Low: employees.filter(e => e.riskLevel === 'Low').length,
  };

  return (
    <AppShell breadcrumb={['Risk Analysis']}>
      <SectionHeader
        title="Risk Analysis"
        description="Individual employee attrition risk scores, contributing factors, and analysis history."
      />

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">High Risk Employees</div>
            <div className="text-[24px] font-semibold text-red-600 leading-none">{counts.High}</div>
            <div className="text-[12px] text-gray-400 mt-1">Immediate review recommended</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Medium Risk Employees</div>
            <div className="text-[24px] font-semibold text-amber-600 leading-none">{counts.Medium}</div>
            <div className="text-[12px] text-gray-400 mt-1">Under monitoring</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Last Analysis Run</div>
            <div className="text-[24px] font-semibold text-gray-900 leading-none">Sep 15</div>
            <div className="text-[12px] text-gray-400 mt-1">Model v2.3 · Dataset 2026-Q3</div>
          </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-slate-800">
            <Sparkles size={15} className="text-indigo-600" /> HR Staff AI Guidance
          </div>
          <div className="grid grid-cols-1 gap-2 text-[12px] leading-5 text-slate-600 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Review High-risk employees first, then Medium-risk employees with rising scores.</div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Use top factor tags to prepare follow-up questions before a 1-on-1.</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-slate-800">
            <ShieldCheck size={15} className="text-amber-600" /> Responsible Use
          </div>
          <p className="text-[12px] leading-5 text-slate-600">This screen provides explainable AI support for triage. HR Staff can review and follow up, but final retention decisions require manager approval and documented intervention history.</p>
        </Card>
      </div>

      {/* Filter + Search bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {(['All', 'High', 'Medium', 'Low'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-[30px] px-3 text-[13px] border transition-colors ${
                filter === f
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
              style={{ borderRadius: '5px' }}
            >
              {f}
              <span className={`ml-1.5 text-[11px] ${filter === f ? 'text-blue-200' : 'text-gray-400'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[30px] pl-8 pr-2.5 border border-gray-300 bg-gray-50 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white"
            style={{ borderRadius: '5px' }}
          />
        </div>
      </div>

      {/* Employee Risk Table */}
      <Card className="mb-4">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Role', 'Risk Level', 'Score', 'Top Factor', 'Last Analysis', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(emp => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                onClick={() => navigate(`/employees/${emp.id}/risk`)}
              >
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
                <td className="px-3 h-[44px]">
                  <span className={`text-[13px] font-semibold ${emp.riskLevel === 'High' ? 'text-red-600' : emp.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                    {emp.riskScore}%
                  </span>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{topFactor(emp.id)}</td>
                <td className="px-3 h-[44px] text-[12px] text-gray-400">{emp.lastAnalysis}</td>
                <td className="px-3 h-[44px]">
                  <button
                    className="text-[13px] text-[#2563EB] hover:underline flex items-center gap-1"
                    onClick={e => { e.stopPropagation(); navigate(`/employees/${emp.id}/risk`); }}
                  >
                    Risk details <ArrowRight size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-gray-400">No employees match the current filter.</div>
        )}
      </Card>

      {/* Analysis History */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200">
          <span className="text-[14px] font-medium text-gray-800">Analysis Run History</span>
          <span className="text-[12px] text-gray-400 ml-2">Recent model analysis executions</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Analysis Date', 'Model Version', 'Dataset', 'Records Analyzed', 'Result'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {analysisHistory.map((run, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{run.date}</td>
                <td className="px-3 h-[44px]">
                  <span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{run.version}</span>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">Employee Dataset 2026-Q3</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">1,248</td>
                <td className="px-3 h-[44px]">
                  <span className={`text-[12px] font-medium ${run.change === 'Increased' ? 'text-red-600' : run.change === 'Decreased' ? 'text-green-600' : 'text-gray-500'}`}>
                    {run.change}
                  </span>
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
