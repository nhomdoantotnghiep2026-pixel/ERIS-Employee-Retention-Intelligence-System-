import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, Button, SectionHeader, Avatar, Input, Select, Pagination, Th, Td } from '../components/ui';
import { employees } from '../data/mockData';
import { Search, FileText, SlidersHorizontal, ArrowUpDown, X, ChevronRight } from 'lucide-react';

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [overtime, setOvertime] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || e.department === dept;
    const matchRisk = !riskFilter || e.riskLevel === riskFilter;
    const matchSatisfaction = !satisfaction || e.jobSatisfaction >= Number(satisfaction);
    const matchOvertime = !overtime || e.overtime === (overtime === 'Yes');
    return matchSearch && matchDept && matchRisk && matchSatisfaction && matchOvertime;
  }).sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const depts = [...new Set(employees.map(e => e.department))];
  const hasFilters = Boolean(dept || riskFilter || satisfaction || overtime || search);
  const clearFilters = () => {
    setSearch(''); setDept(''); setRiskFilter(''); setSatisfaction(''); setOvertime(''); setPage(1);
  };
  const openEmployee = (id: string) => navigate(`/employees/${id}`);

  return (
    <AppShell breadcrumb={['Employees']}>
      <SectionHeader title="Employees" description="Search and review employee information used for retention analysis.">
        <Button variant="secondary" size="sm" onClick={() => navigate(user.role === 'HR Staff' ? '/export-reports' : '/reports')}><FileText size={15} /> Open reports</Button>
      </SectionHeader>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <Input ariaLabel="Search employees by name or ID" placeholder="Search employees..." value={search} onChange={v => { setSearch(v); setPage(1); }} icon={<Search size={15} />} className="w-full sm:w-64" />
        <Select ariaLabel="Filter by department" value={dept} onChange={v => { setDept(v); setPage(1); }} options={depts} placeholder="All departments" className="min-w-0 flex-1 sm:flex-none" />
        <Select ariaLabel="Filter by risk level" value={riskFilter} onChange={v => { setRiskFilter(v); setPage(1); }} options={['High', 'Medium', 'Low']} placeholder="All risk levels" className="min-w-0 flex-1 sm:flex-none" />
        <Button variant="secondary" size="sm" aria-expanded={advancedOpen} aria-controls="advanced-filters" onClick={() => setAdvancedOpen(open => !open)}><SlidersHorizontal size={15} /> {advancedOpen ? 'Fewer filters' : 'More filters'}</Button>
        <div className="flex-1" />
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {dept && (
              <button onClick={() => setDept('')} className="inline-flex items-center gap-1 px-2 h-[24px] bg-blue-50 text-blue-700 border border-blue-200 text-[12px] font-medium" style={{ borderRadius: '4px' }}>
                {dept} <X size={10} />
              </button>
            )}
            {riskFilter && (
              <button onClick={() => setRiskFilter('')} className="inline-flex items-center gap-1 px-2 h-[24px] bg-blue-50 text-blue-700 border border-blue-200 text-[12px] font-medium" style={{ borderRadius: '4px' }}>
                {riskFilter} Risk <X size={10} />
              </button>
            )}
            <button onClick={clearFilters} className="min-h-10 px-2 text-[13px] font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-indigo-500">Clear all</button>
          </div>
        )}
        {advancedOpen && (
          <div id="advanced-filters" className="grid w-full grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-[12px] font-medium text-slate-600">
              Minimum job satisfaction
              <Select ariaLabel="Minimum job satisfaction" value={satisfaction} onChange={v => { setSatisfaction(v); setPage(1); }} options={['1', '2', '3', '4', '5']} placeholder="Any rating" className="w-full" />
            </label>
            <label className="space-y-1.5 text-[12px] font-medium text-slate-600">
              Overtime status
              <Select ariaLabel="Filter by overtime status" value={overtime} onChange={v => { setOvertime(v); setPage(1); }} options={['Yes', 'No']} placeholder="Any status" className="w-full" />
            </label>
          </div>
        )}
      </div>

      <Card>
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <span className="text-[13px] font-medium text-slate-600">{filtered.length} of {employees.length} demo employee records</span>
          <span className="hidden text-[12px] text-slate-400 md:block">Select a row to open the employee profile</span>
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {paged.map(emp => (
            <button key={emp.id} onClick={() => openEmployee(emp.id)} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-indigo-50/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500">
              <Avatar initials={emp.initials} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">{emp.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-slate-500">{emp.role} · {emp.department}</span>
                <span className="mt-2 flex items-center gap-2"><RiskBadge level={emp.riskLevel} /><span className="font-mono text-[12px] font-semibold text-slate-700">{emp.riskScore}%</span></span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </button>
          ))}
          {paged.length === 0 && <div className="px-4 py-12 text-center"><p className="text-sm font-medium text-slate-700">No employees match these filters</p><button onClick={clearFilters} className="mt-2 min-h-10 text-sm font-semibold text-indigo-600">Clear filters</button></div>}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <Th><button onClick={() => setSortAsc(value => !value)} aria-label={`Sort employees by name ${sortAsc ? 'descending' : 'ascending'}`} className="flex min-h-10 items-center gap-1 rounded px-1 focus-visible:outline-2 focus-visible:outline-indigo-500">Employee <ArrowUpDown size={12} className="text-slate-400" /></button></Th>
                <Th>ID</Th>
                <Th>Department</Th>
                <Th>Role</Th>
                <Th>Tenure</Th>
                <Th>Job Satisfaction</Th>
                <Th>Risk Level</Th>
                <Th>Score</Th>
                <Th>Last Analysis</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map(emp => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  tabIndex={0}
                  aria-label={`Open profile for ${emp.name}`}
                  onClick={() => openEmployee(emp.id)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openEmployee(emp.id); } }}
                >
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar initials={emp.initials} size="sm" />
                      <span className="font-medium text-gray-800">{emp.name}</span>
                    </div>
                  </Td>
                  <Td><span className="font-mono text-[12px] text-gray-400">{emp.employeeId}</span></Td>
                  <Td>{emp.department}</Td>
                  <Td>{emp.role}</Td>
                  <Td>{emp.tenure} yr</Td>
                  <Td>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-sm ${i < emp.jobSatisfaction ? 'bg-[#4F46E5]' : 'bg-slate-100'}`} />
                      ))}
                      <span className="text-[11px] text-gray-400 ml-1">{emp.jobSatisfaction}/5</span>
                    </div>
                  </Td>
                  <Td><RiskBadge level={emp.riskLevel} /></Td>
                  <Td>
                    <span className={`text-[13px] font-semibold ${emp.riskLevel === 'High' ? 'text-red-600' : emp.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                      {emp.riskScore}%
                    </span>
                  </Td>
                  <Td className="text-[12px] text-gray-400">{emp.lastAnalysis}</Td>
                  <Td>
                    <button aria-label={`View ${emp.name}`} className="min-h-10 px-2 text-[13px] font-semibold text-[#4F46E5] hover:underline focus-visible:outline-2 focus-visible:outline-indigo-500" onClick={e => { e.stopPropagation(); openEmployee(emp.id); }}>
                      View
                    </button>
                  </Td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-10 text-center text-[13px] text-slate-500">No employees match these filters. <button onClick={clearFilters} className="font-semibold text-indigo-600 hover:underline">Clear filters</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > perPage && (
          <div className="px-3 py-2.5 border-t border-gray-200">
            <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
          </div>
        )}
      </Card>
    </AppShell>
  );
}
