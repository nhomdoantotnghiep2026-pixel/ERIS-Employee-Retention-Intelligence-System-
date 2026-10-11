import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, SectionHeader, Avatar } from '../components/ui';
import { employees } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const highRisk = employees.filter(e => e.riskLevel === 'High');
const mediumRisk = employees.filter(e => e.riskLevel === 'Medium');
const lowRisk = employees.filter(e => e.riskLevel === 'Low');

// Recent risk results: last 6 analyzed (simulate with slice + fake prev level)
const recentChanges = [
  { ...employees[0], prevLevel: 'Medium', changed: true },
  { ...employees[2], prevLevel: 'High', changed: true },
  { ...employees[4], prevLevel: 'High', changed: false },
  { ...employees[6], prevLevel: 'Low', changed: true },
  { ...employees[1], prevLevel: 'Medium', changed: false },
];

export default function StaffOverview() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <SectionHeader
        title="Overview"
        description="Individual employee attrition risk status and recent analysis results."
      />

      {/* Summary strip */}
      <Card className="mb-4">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <div className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Total Employees</div>
            <div className="text-[26px] font-semibold text-gray-900 leading-none">{employees.length}</div>
            <div className="text-[12px] text-gray-400 mt-1">In your view</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Requiring Review</div>
            <div className="text-[26px] font-semibold text-red-600 leading-none">{highRisk.length}</div>
            <div className="text-[12px] text-gray-400 mt-1">High-risk employees</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Under Monitoring</div>
            <div className="text-[26px] font-semibold text-amber-600 leading-none">{mediumRisk.length}</div>
            <div className="text-[12px] text-gray-400 mt-1">Medium-risk employees</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-[12px] text-gray-500 mb-1">Low Risk</div>
            <div className="text-[26px] font-semibold text-green-600 leading-none">{lowRisk.length}</div>
            <div className="text-[12px] text-gray-400 mt-1">Stable status</div>
          </div>
        </div>
      </Card>

      {/* Employees Requiring Review */}
      <Card className="mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[14px] font-medium text-gray-800">Employees Requiring Review</span>
            <span className="text-[12px] text-gray-400 ml-2">High-risk employees that need follow-up</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Role', 'Risk', 'Score', 'Top Factor', 'Last Analysis', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {highRisk.slice(0, 6).map(emp => (
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

      {/* Recent Risk Results */}
      <Card>
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[14px] font-medium text-gray-800">Recent Risk Results</span>
            <span className="text-[12px] text-gray-400 ml-2">Latest individual analysis updates</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Risk', 'Score', 'Change', 'Analysis Date', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentChanges.map((emp, i) => (
              <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.initials} size="sm" />
                    <div className="text-[13px] font-medium text-gray-800">{emp.name}</div>
                  </div>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{emp.department}</td>
                <td className="px-3 h-[44px]"><RiskBadge level={emp.riskLevel} /></td>
                <td className="px-3 h-[44px]">
                  <span className={`text-[13px] font-semibold ${emp.riskLevel === 'High' ? 'text-red-600' : emp.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                    {emp.riskScore}%
                  </span>
                </td>
                <td className="px-3 h-[44px]">
                  {emp.changed ? (
                    emp.riskLevel === 'High' && emp.prevLevel !== 'High'
                      ? <span className="text-[12px] text-red-500 flex items-center gap-1"><TrendingUp size={11} /> Escalated from {emp.prevLevel}</span>
                      : emp.riskLevel === 'Low' && emp.prevLevel !== 'Low'
                      ? <span className="text-[12px] text-green-600 flex items-center gap-1"><TrendingDown size={11} /> Improved from {emp.prevLevel}</span>
                      : <span className="text-[12px] text-amber-500 flex items-center gap-1"><TrendingUp size={11} /> Changed from {emp.prevLevel}</span>
                  ) : (
                    <span className="text-[12px] text-gray-400 flex items-center gap-1"><Minus size={11} /> No change</span>
                  )}
                </td>
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
    </AppShell>
  );
}
