import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, RiskBadge, Button, Select, Input, Th, Td, AIAdvisoryBanner, Avatar, Pagination } from '../components/ui';
import { employees, departments, riskTrendData } from '../data/mockData';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Search, TrendingUp, TrendingDown, Filter, UserRound, X } from 'lucide-react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

const riskSummary = { high: 126, medium: 312, low: 810, total: 1248 };

export default function AttritionRisk() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const selectedEmployee = employeeRows.find(employee => employee.id === searchParams.get('employee'));

  const openRiskDetail = (employeeId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('employee', employeeId);
    setSearchParams(nextParams);
  };

  const closeRiskDetail = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('employee');
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!selectedEmployee) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRiskDetail();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedEmployee?.id]);

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
  return (
    <AppShell breadcrumb={['Performance & Retention', 'Attrition Risk Analytics']}>
      <SectionHeader title="Attrition Risk Analytics" description="AI-powered attrition predictions across the workforce">
        <Button variant="secondary" size="sm" onClick={exportCsv}>Export CSV</Button>
      </SectionHeader>

      {/* Risk summary */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'High Risk', count: riskSummary.high, pct: Math.round(riskSummary.high / riskSummary.total * 100), color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
          { label: 'Medium Risk', count: riskSummary.medium, pct: Math.round(riskSummary.medium / riskSummary.total * 100), color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' },
          { label: 'Low Risk', count: riskSummary.low, pct: Math.round(riskSummary.low / riskSummary.total * 100), color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500' },
          { label: 'Total Analyzed', count: riskSummary.total, pct: 100, color: 'text-slate-700', bg: 'bg-slate-50', bar: 'bg-slate-400' },
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
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
        <div className="flex flex-col gap-2 border-b border-slate-100 p-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search employees..."
            icon={<Search size={13} />}
            className="w-full sm:w-56"
          />
          <Select value={riskFilter} onChange={setRiskFilter} options={['High', 'Medium', 'Low']} placeholder="All risk levels" className="w-full sm:w-40" />
          <Select value={deptFilter} onChange={setDeptFilter} options={deptOptions} placeholder="All departments" className="w-full sm:w-44" />
          {(riskFilter || deptFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setRiskFilter(''); setDeptFilter(''); }}>
              <Filter size={12} /> Clear
            </Button>
          )}
          <div className="text-[12px] text-slate-400 sm:ml-auto">{filtered.length} representative employee records</div>
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {paginated.map(emp => (
            <div key={emp.id} className="flex items-center gap-3 p-4">
              <Avatar initials={emp.initials} size="md" />
              <button className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => openRiskDetail(emp.id)}>
                <span className="block truncate text-sm font-semibold text-slate-900">{emp.name}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{emp.role} · {emp.department}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2"><RiskBadge level={emp.riskLevel} score={emp.riskScore} /><span className="text-xs text-slate-400">{emp.lastAnalysis}</span></span>
              </button>
              <button aria-label={`View risk analysis for ${emp.name}`} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-orange-600 transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => openRiskDetail(emp.id)}>
                <ChevronRight size={19} />
              </button>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto overscroll-x-contain md:block">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200">
              <Th>Employee</Th>
              <Th>Department</Th>
              <Th>Job Role</Th>
              <Th>Tenure</Th>
              <Th>Risk Score</Th>
              <Th>Last Analyzed</Th>
              <Th><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => openRiskDetail(emp.id)}>
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
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openRiskDetail(emp.id); }}>
                    View →
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>

      {selectedEmployee && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="risk-detail-title">
          <button type="button" aria-label="Close risk analysis" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" onClick={closeRiskDetail} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-[#F7F7FB] shadow-[-18px_0_50px_rgba(15,23,42,0.18)]">
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <Avatar initials={selectedEmployee.initials} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="risk-detail-title" className="truncate text-lg font-bold text-slate-900">{selectedEmployee.name}</h2>
                  <RiskBadge level={selectedEmployee.riskLevel} score={selectedEmployee.riskScore} />
                </div>
                <p className="truncate text-xs text-slate-500">{selectedEmployee.role} · {selectedEmployee.department} · {selectedEmployee.employeeId}</p>
              </div>
              <button type="button" aria-label="Close risk analysis" onClick={closeRiskDetail} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-orange-500"><X size={20} /></button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              <Card className="p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="shrink-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Predicted attrition risk</div>
                    <div className={`mt-1 text-5xl font-bold leading-none ${selectedEmployee.riskLevel === 'High' ? 'text-red-600' : selectedEmployee.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{selectedEmployee.riskScore}%</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-red-300">
                      <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow" style={{ left: `${selectedEmployee.riskScore}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>Low</span><span>Medium</span><span>High</span></div>
                    <p className="mt-3 text-xs leading-5 text-slate-600">Latest analysis: <b className="text-slate-800">{selectedEmployee.lastAnalysis}</b>. This score is advisory and requires HR review before action.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-slate-900">Key contributing signals</h3>
                <p className="mt-1 text-xs text-slate-500">Employee-specific factors used to support the current risk assessment.</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Overtime', value: selectedEmployee.overtime ? 86 : 18, detail: selectedEmployee.overtime ? 'Active overtime pattern' : 'No overtime pattern' },
                    { label: 'Job satisfaction', value: (6 - selectedEmployee.jobSatisfaction) * 18, detail: `${selectedEmployee.jobSatisfaction}/5 current rating` },
                    { label: 'Work-life balance', value: (5 - selectedEmployee.workLifeBalance) * 20, detail: `${selectedEmployee.workLifeBalance}/4 current rating` },
                    { label: 'Business travel', value: selectedEmployee.businessTravel === 'Frequently' ? 68 : selectedEmployee.businessTravel === 'Rarely' ? 32 : 12, detail: selectedEmployee.businessTravel },
                  ].map(signal => (
                    <div key={signal.label}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-700">{signal.label}</span><span className="text-slate-400">{signal.detail}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${signal.value >= 65 ? 'bg-red-400' : signal.value >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${signal.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-slate-900">Employee snapshot</h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 text-xs">
                  {[
                    ['Tenure', `${selectedEmployee.tenure} years`],
                    ['Job level', String(selectedEmployee.jobLevel)],
                    ['Monthly income', `$${selectedEmployee.monthlyIncome.toLocaleString()}`],
                    ['Environment satisfaction', `${selectedEmployee.environmentSatisfaction}/4`],
                    ['Work-life balance', `${selectedEmployee.workLifeBalance}/4`],
                    ['Travel frequency', selectedEmployee.businessTravel],
                  ].map(([label, value]) => <div key={label}><dt className="text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div>)}
                </dl>
              </Card>
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
              <Button variant="secondary" onClick={() => navigate(`/employees/${selectedEmployee.id}`, { state: { returnTo: '/attrition-risk' } })}><UserRound size={15} /> Open employee profile</Button>
              <Button onClick={() => navigate(`/interventions?employee=${selectedEmployee.id}`)}>Create intervention <ChevronRight size={15} /></Button>
            </footer>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
