import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, StatusBadge, Input, Select } from '../components/ui';
import { dataRecords, employees } from '../data/mockData';
import { Search, Upload, Layers, Eye } from 'lucide-react';

export default function EmployeeData() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [validationFilter, setValidationFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const filtered = dataRecords.filter(r =>
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())) &&
    (!validationFilter || r.validationStatus === validationFilter) &&
    (!deptFilter || r.department === deptFilter)
  );
  const openRecord = (employeeId: string) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    if (employee) navigate(`/employees/${employee.id}`);
  };

  return (
    <AppShell breadcrumb={['Employee Data']}>
      <SectionHeader title="Employee Data" description="Manage employee datasets used for attrition analysis.">
        <Button variant="secondary" size="sm" onClick={() => navigate('/preparation')}><Layers size={13} /> Prepare Data</Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/import')}><Upload size={13} /> Import Data</Button>
      </SectionHeader>

      {/* Summary row */}
      <Card className="mb-4">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <div className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Total Records</div>
            <div className="text-[24px] font-semibold text-gray-900">1,248</div>
            <div className="text-[12px] text-gray-400">Employee Dataset 2026-Q3</div>
          </div>
          <div className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Valid Records</div>
            <div className="text-[24px] font-semibold text-green-600">1,186</div>
            <div className="text-[12px] text-gray-400">95.0% complete</div>
          </div>
          <div className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Warnings</div>
            <div className="text-[24px] font-semibold text-amber-600">48</div>
            <div className="text-[12px] text-gray-400">3.8% with issues</div>
          </div>
          <div className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Invalid Records</div>
            <div className="text-[24px] font-semibold text-red-600">14</div>
            <div className="text-[12px] text-gray-400">1.1% errors</div>
          </div>
        </div>
      </Card>

      {/* Dataset info bar */}
      <div className="flex items-center justify-between mb-3 px-3 py-2 bg-white border border-gray-200" style={{ borderRadius: '6px' }}>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-gray-800">Employee Dataset 2026-Q3</span>
          <span className="text-[12px] text-gray-400">Updated Sep 22, 2026 · Nguyen Data</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 h-[24px] flex items-center" style={{ borderRadius: '4px' }}>Ready for Analysis</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/preparation')}>View Preparation</Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Input placeholder="Search records..." value={search} onChange={setSearch} icon={<Search size={13} />} className="w-52" />
        <Select value={validationFilter} onChange={setValidationFilter} options={['Valid', 'Warning', 'Invalid']} placeholder="Validation Status" />
        <Select value={deptFilter} onChange={setDeptFilter} options={['Engineering', 'Sales', 'Operations', 'Finance', 'Marketing']} placeholder="Department" />
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee ID', 'Employee', 'Department', 'Completeness', 'Validation', 'Last Updated', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/60">
                <td className="px-3 h-[44px] font-mono text-[12px] text-gray-400">{r.id}</td>
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{r.name}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{r.department}</td>
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${r.completeness === 100 ? 'bg-green-500' : r.completeness >= 85 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${r.completeness}%` }} />
                    </div>
                    <span className="text-[12px] text-gray-500">{r.completeness}%</span>
                  </div>
                </td>
                <td className="px-3 h-[44px]"><StatusBadge status={r.validationStatus} /></td>
                <td className="px-3 h-[44px] text-[12px] text-gray-400">{r.lastUpdated}</td>
                <td className="px-3 h-[44px]">
                  <button onClick={() => openRecord(r.id)} className="text-[13px] text-[#2563EB] hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
