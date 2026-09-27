import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, AIAdvisoryBanner } from '../components/ui';
import { Download, FileText, Calendar } from 'lucide-react';
import { demoPdfContent, downloadTextFile, slugify, toCsv } from '../utils/demoActions';

const reportTemplates = [
  { title: 'My Team Risk Summary', desc: 'Attrition risk scores and status for your assigned employees.', format: 'PDF / CSV', lastExport: 'Sep 20, 2026' },
  { title: 'Intervention Activity Log', desc: 'All retention tasks and 1-on-1 notes from the last 90 days.', format: 'PDF', lastExport: 'Sep 15, 2026' },
  { title: 'Pulse Survey Results', desc: 'Engagement scores and response breakdown for your team.', format: 'PDF / CSV', lastExport: 'Sep 18, 2026' },
  { title: 'Employee Risk Trend', desc: 'Month-over-month attrition risk change per employee.', format: 'CSV', lastExport: 'Sep 10, 2026' },
];

const recentExports = [
  { file: 'team_risk_summary_sep2026.pdf', generated: 'Sep 20, 2026 14:05', size: '1.2 MB' },
  { file: 'pulse_survey_q3_2026.pdf', generated: 'Sep 18, 2026 10:22', size: '540 KB' },
  { file: 'intervention_log_sep2026.pdf', generated: 'Sep 15, 2026 09:11', size: '320 KB' },
];

export default function ExportReports() {
  const exportReport = (title: string, format: string) => {
    const filename = `${slugify(title)}.${format.includes('CSV') ? 'csv' : 'pdf'}`;
    if (filename.endsWith('.csv')) {
      downloadTextFile(filename, toCsv([
        { report: title, generated: new Date().toLocaleString(), scope: 'Assigned team', status: 'Ready' },
      ]), 'text/csv;charset=utf-8');
      return;
    }
    downloadTextFile(filename, demoPdfContent(title, 'This downloadable demo report contains scoped retention insights, risk summaries, and recommended follow-up actions.'));
  };

  return (
    <AppShell breadcrumb={['Reports', 'Export Reports']}>
      <SectionHeader title="Export Reports" description="Generate and download reports scoped to your team and responsibilities">
      </SectionHeader>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {reportTemplates.map(r => (
          <Card key={r.title} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-[6px] flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-slate-800 mb-0.5">{r.title}</div>
                <div className="text-[12px] text-slate-500 mb-2">{r.desc}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar size={11} /> Last: {r.lastExport}
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{r.format}</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => exportReport(r.title, r.format)}><Download size={12} /> Export</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">Recent Exports</div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['File', 'Generated', 'Size', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentExports.map(e => (
              <tr key={e.file} className="hover:bg-slate-50/60">
                <td className="px-4 h-[48px]">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-indigo-400 flex-shrink-0" />
                    <span className="font-mono text-[12px] text-slate-700">{e.file}</span>
                  </div>
                </td>
                <td className="px-4 h-[48px] text-[13px] text-slate-500">{e.generated}</td>
                <td className="px-4 h-[48px] text-[12px] font-mono text-slate-400">{e.size}</td>
                <td className="px-4 h-[48px]">
                  <Button variant="ghost" size="sm" onClick={() => downloadTextFile(e.file, demoPdfContent(e.file, `Original export generated ${e.generated}. File size: ${e.size}.`))}><Download size={12} /> Re-download</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
