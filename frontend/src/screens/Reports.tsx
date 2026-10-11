import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, Select, Tabs } from '../components/ui';
import { reports as initialReports } from '../data/mockData';
import { Download, Eye, Plus, RefreshCw, FileText } from 'lucide-react';
import { demoPdfContent, downloadTextFile, slugify } from '../utils/demoActions';

export default function Reports() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [rows, setRows] = useState(initialReports);

  const categories = ['All', 'Overview', 'Department', 'Employee', 'Factors', 'AI Model'];

  const filtered = tab === 'All' ? rows : rows.filter(r => r.category === tab);
  const newReport = () => {
    setRows(current => [
      {
        id: `report-${Date.now()}`,
        name: 'Ad-hoc Retention Snapshot',
        description: 'Generated from the current demo workforce and risk analysis data.',
        category: 'Overview',
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        owner: 'Current user',
      },
      ...current,
    ]);
    setTab('All');
  };
  const regenerate = (id: string) => {
    setRows(current => current.map(row => row.id === id ? { ...row, lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : row));
  };

  return (
    <AppShell breadcrumb={['Reports']}>
      <SectionHeader title="Reports" description="Create and review reports for employee retention analysis.">
        <Button variant="primary" size="sm" onClick={newReport}><Plus size={13} /> New Report</Button>
      </SectionHeader>

      <Tabs tabs={categories} active={tab} onChange={setTab} />

      {/* Reports table */}
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Report Name', 'Description', 'Category', 'Last Generated', 'Owner', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="text-[13px] font-medium text-gray-800">{r.name}</span>
                  </div>
                </td>
                <td className="px-3 h-[44px]">
                  <span className="text-[13px] text-gray-500 line-clamp-1 max-w-xs">{r.description}</span>
                </td>
                <td className="px-3 h-[44px]">
                  <span className="text-[12px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{r.category}</span>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-500">{r.lastGenerated}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-500">{r.owner}</td>
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/reports/detail')}>
                      <Eye size={12} /> View
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`Regenerate ${r.name}`} onClick={() => regenerate(r.id)}>
                      <RefreshCw size={12} />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`Download ${r.name}`} onClick={() => downloadTextFile(`${slugify(r.name)}.pdf`, demoPdfContent(r.name, r.description))}>
                      <Download size={12} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-[13px] text-gray-400">No reports in this category.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
