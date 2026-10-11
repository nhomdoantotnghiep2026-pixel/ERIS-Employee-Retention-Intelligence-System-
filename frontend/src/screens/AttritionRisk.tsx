import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, RiskBadge, Button, Select, Input, Th, Td, AIAdvisoryBanner, Pagination } from '../components/ui';
import { employees, departments, riskTrendData } from '../data/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

const highCount = employees.filter(e => e.riskLevel === 'High').length;
const medCount = employees.filter(e => e.riskLevel === 'Medium').length;
const lowCount = employees.filter(e => e.riskLevel === 'Low').length;

export default function AttritionRisk() {
  const navigate = useNavigate();
  const [employeeRows, setEmployeeRows] = useState(employees);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = employeeRows.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
    const matchRisk = !riskFilter || e.riskLevel === riskFilter;
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchRisk && matchDept;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const deptOptions = Array.from(new Set(employeeRows.map(e => e.department)));
  const exportCsv = () => {
    downloadTextFile('attrition-risk-export.csv', toCsv(filtered.map(e => ({
      employeeId: e.employeeId,
      name: e.name,
      department: e.department,
      role: e.role,
      riskLevel: e.riskLevel,
      riskScore: e.riskScore,
      lastAnalysis: e.lastAnalysis,
    }))), 'text/csv;charset=utf-8');
  };
  const runAnalysis = () => {
    setEmployeeRows(rows => rows.map((row, index) => {
      const riskScore = Math.max(5, Math.min(96, row.riskScore + (index % 3 === 0 ? 2 : index % 3 === 1 ? -1 : 1)));
      const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
      return { ...row, riskScore, riskLevel, lastAnalysis: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    }));
    setPage(1);
  };

  return (
    <AppShell breadcrumb={['Performance & Retention', 'Attrition Risk Analytics']}>
      <SectionHeader title="Attrition Risk Analytics" description="AI-powered attrition predictions across the workforce">
        <Button variant="secondary" size="sm" onClick={exportCsv}>Export CSV</Button>
        <Button variant="primary" size="sm" onClick={runAnalysis}>Run New Analysis</Button>
      </SectionHeader>

      {/* Risk summary */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'High Risk', count: highCount, pct: Math.round(highCount / employees.length * 100), color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
          { label: 'Medium Risk', count: medCount, pct: Math.round(medCount / employees.length * 100), color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' },
          { label: 'Low Risk', count: lowCount, pct: Math.round(lowCount / employees.length * 100), color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500' },
          { label: 'Total Analyzed', count: employees.length, pct: 100, color: 'text-slate-700', bg: 'bg-slate-50', bar: 'bg-slate-400' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${s.color}`}>{s.count}</div>
            <div className="mt-2 bg-slate-100 rounded-full h-1 overflow-hidden">
              <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{s.pct}% of workforce</div>
          </Card>
        ))}
      </div>

      {/* Risk trend by dept */}
      <Card className="p-4 mb-5">
        <div className="text-[14px] font-semibold text-slate-800 mb-3">Department Risk Trend (6 months)</div>
        <div className="grid grid-cols-6 gap-3">
          {departments.map(dept => {
            const pct = Math.round(dept.highRisk / dept.employees * 100);
            return (
              <div key={dept.name} className="text-center">
                <div className="text-[11px] text-slate-500 mb-1.5 truncate">{dept.name}</div>
                <div className={`text-[20px] font-bold ${pct > 20 ? 'text-red-600' : pct > 12 ? 'text-amber-600' : 'text-green-600'}`}>{pct}%</div>
                <div className="flex justify-center mt-1">
                  {dept.trend === 'up' ? <TrendingUp size={12} className="text-red-400" /> : dept.trend === 'down' ? <TrendingDown size={12} className="text-green-500" /> : <span className="text-[11px] text-slate-300">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Employee table */}
      <Card>
        <div className="flex items-center gap-2 p-3 border-b border-slate-100">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search employees..."
            icon={<Search size={13} />}
            className="w-56"
          />
          <Select value={riskFilter} onChange={setRiskFilter} options={['High', 'Medium', 'Low']} placeholder="All risk levels" className="w-40" />
          <Select value={deptFilter} onChange={setDeptFilter} options={deptOptions} placeholder="All departments" className="w-44" />
          {(riskFilter || deptFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setRiskFilter(''); setDeptFilter(''); }}>
              <Filter size={12} /> Clear
            </Button>
          )}
          <div className="ml-auto text-[12px] text-slate-400">{filtered.length} employees</div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <Th>Employee</Th>
              <Th>Department</Th>
              <Th>Job Role</Th>
              <Th>Tenure</Th>
              <Th>Risk Score</Th>
              <Th>Last Analyzed</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => navigate(`/employees/${emp.id}`)}>
                <Td>
                  <div className="font-medium text-slate-800">{emp.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId}</div>
                </Td>
                <Td>{emp.department}</Td>
                <Td>{emp.role}</Td>
                <Td><span className="font-mono">{emp.tenure}y</span></Td>
                <Td><RiskBadge level={emp.riskLevel} score={emp.riskScore} /></Td>
                <Td className="text-slate-400">{emp.lastAnalysis}</Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/employees/${emp.id}/risk`); }}>
                    View →
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
