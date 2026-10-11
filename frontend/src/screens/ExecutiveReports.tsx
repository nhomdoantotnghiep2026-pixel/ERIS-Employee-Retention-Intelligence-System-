import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, AIAdvisoryBanner } from '../components/ui';
import { FileBarChart2, Download, Eye, Calendar, X, Clock } from 'lucide-react';
import { useState } from 'react';
import { demoPdfContent, downloadTextFile, slugify } from '../utils/demoActions';

const reports = [
  { title: 'Q3 2026 Workforce Retention Report', type: 'Quarterly', date: 'Sep 22, 2026', pages: 18, status: 'Ready', desc: 'Comprehensive attrition analysis across all departments. Includes AI risk distribution, key contributors, and intervention outcomes.' },
  { title: 'Monthly Attrition Dashboard – Sep 2026', type: 'Monthly', date: 'Sep 20, 2026', pages: 8, status: 'Ready', desc: 'Real-time attrition risk snapshot. Month-over-month trends for Engineering and Sales flagged as high concern.' },
  { title: 'Engagement Survey Analysis Q3 2026', type: 'Survey', date: 'Sep 18, 2026', pages: 12, status: 'Ready', desc: 'Detailed breakdown of satisfaction scores across all 6 departments. Work-life balance and career growth scores declining.' },
  { title: 'HR Intervention Effectiveness Review', type: 'Special', date: 'Sep 10, 2026', pages: 6, status: 'Ready', desc: 'Outcomes of 12 retention interventions in Q3 2026. 8 resolved positively, 2 ongoing, 2 escalated.' },
  { title: 'Annual Turnover Cost Analysis FY2026', type: 'Annual', date: 'Aug 30, 2026', pages: 24, status: 'Ready', desc: 'Financial impact of voluntary attrition. Estimated replacement cost: $2.4M. Recommended investment in retention: $480K.' },
  { title: 'Q2 2026 Workforce Retention Report', type: 'Quarterly', date: 'Jun 28, 2026', pages: 17, status: 'Archived', desc: 'Q2 summary. Stable attrition in Operations and Finance; Engineering shows early warning signals.' },
];

const typeStyles: Record<string, string> = {
  Quarterly: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  Monthly: 'bg-blue-50 text-blue-700 border border-blue-200',
  Survey: 'bg-violet-50 text-violet-700 border border-violet-200',
  Special: 'bg-amber-50 text-amber-700 border border-amber-200',
  Annual: 'bg-green-50 text-green-700 border border-green-200',
};

export default function ExecutiveReports() {
  const [preview, setPreview] = useState<(typeof reports)[number] | null>(null);
  const [generated, setGenerated] = useState(reports);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledReports, setScheduledReports] = useState([
    { title: 'Monthly Attrition Dashboard', frequency: 'Monthly', nextRun: 'Oct 1, 2026', recipients: 'hr-leads@eris.com' },
    { title: 'Q4 Workforce Retention Report', frequency: 'Quarterly', nextRun: 'Dec 30, 2026', recipients: 'executives@eris.com' },
    { title: 'Engagement Pulse Summary', frequency: 'Bi-weekly', nextRun: 'Oct 6, 2026', recipients: 'people-team@eris.com' },
  ]);
  const [scheduleForm, setScheduleForm] = useState({
    title: reports[0].title,
    frequency: 'Monthly',
    nextRun: '2026-10-01',
    recipients: 'hr-leads@eris.com',
  });

  const generateReport = () => {
    const next = {
      title: `Ad-hoc Retention Snapshot ${new Date().toLocaleDateString()}`,
      type: 'Special',
      date: new Date().toLocaleDateString(),
      pages: 5,
      status: 'Ready',
      desc: 'Generated on demand from current workforce and attrition-risk demo data.',
    };
    setGenerated([next, ...generated]);
  };

  const scheduleReport = () => {
    if (!scheduleForm.title || !scheduleForm.nextRun || !scheduleForm.recipients.trim()) return;
    setScheduledReports(rows => [
      {
        title: scheduleForm.title,
        frequency: scheduleForm.frequency,
        nextRun: new Date(scheduleForm.nextRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        recipients: scheduleForm.recipients.trim(),
      },
      ...rows,
    ]);
    setShowSchedule(false);
  };

  return (
    <AppShell breadcrumb={['Reports', 'Executive Reports']}>
      <SectionHeader title="Executive Reports & Exports" description="Scheduled and on-demand workforce intelligence reports">
        <Button variant="secondary" size="sm" onClick={() => setShowSchedule(true)}><Calendar size={13} /> Schedule Report</Button>
        <Button variant="primary" size="sm" onClick={generateReport}><FileBarChart2 size={13} /> Generate New</Button>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Reports Generated (2026)', value: generated.length + 18 },
          { label: 'Downloads This Month', value: 11 },
          { label: 'Scheduled Reports', value: scheduledReports.length },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className="text-[28px] font-semibold text-slate-900 leading-none">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <div className="text-[14px] font-semibold text-slate-800">Scheduled Reports</div>
            <div className="text-[12px] text-slate-500">Upcoming automated report deliveries</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSchedule(true)}><Calendar size={13} /> Add schedule</Button>
        </div>
        <div className="divide-y divide-slate-50">
          {scheduledReports.map((r, index) => (
            <div key={`${r.title}-${index}`} className="grid grid-cols-1 gap-2 px-4 py-3 text-[13px] sm:grid-cols-[minmax(0,1fr)_120px_130px_minmax(160px,220px)] sm:items-center">
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-800">{r.title}</div>
                <div className="truncate text-[12px] text-slate-400">{r.recipients}</div>
              </div>
              <span className="w-fit rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700">{r.frequency}</span>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500"><Clock size={12} /> {r.nextRun}</div>
              <div className="flex justify-start sm:justify-end">
                <Button variant="ghost" size="sm" onClick={() => setScheduledReports(rows => rows.filter((_, i) => i !== index))}>Cancel</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {generated.map(r => (
          <Card key={r.title} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-[6px] flex items-center justify-center flex-shrink-0">
                  <FileBarChart2 size={16} className="text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-slate-900">{r.title}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium h-[20px] ${typeStyles[r.type] || ''}`}>{r.type}</span>
                    {r.status === 'Archived' && <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Archived</span>}
                  </div>
                  <div className="text-[13px] text-slate-500 mb-1">{r.desc}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar size={11} /> {r.date}
                    <span>·</span>
                    <span>{r.pages} pages</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setPreview(r)}><Eye size={13} /> Preview</Button>
                <Button variant="secondary" size="sm" onClick={() => downloadTextFile(`${slugify(r.title)}.pdf`, demoPdfContent(r.title, r.desc))}><Download size={13} /> Download PDF</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4"><AIAdvisoryBanner /></div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <Card className="w-full max-w-xl p-5">
            <div className="mb-2 text-[16px] font-semibold text-slate-900">{preview.title}</div>
            <div className="mb-4 text-[13px] leading-6 text-slate-600">{preview.desc}</div>
            <div className="grid grid-cols-3 gap-3 text-[12px] text-slate-500">
              <div><span className="block font-semibold text-slate-700">Type</span>{preview.type}</div>
              <div><span className="block font-semibold text-slate-700">Date</span>{preview.date}</div>
              <div><span className="block font-semibold text-slate-700">Pages</span>{preview.pages}</div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
              <Button variant="primary" onClick={() => downloadTextFile(`${slugify(preview.title)}.pdf`, demoPdfContent(preview.title, preview.desc))}><Download size={13} /> Download</Button>
            </div>
          </Card>
        </div>
      )}

      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <Card className="w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">Schedule Report</div>
                <div className="text-[12px] text-slate-500">Create an automated executive report delivery.</div>
              </div>
              <button type="button" onClick={() => setShowSchedule(false)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100" aria-label="Close schedule dialog">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">Report</label>
                <select value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                  {generated.map(r => <option key={r.title} value={r.title}>{r.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-slate-700">Frequency</label>
                  <select value={scheduleForm.frequency} onChange={e => setScheduleForm({ ...scheduleForm, frequency: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    {['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'].map(freq => <option key={freq}>{freq}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-slate-700">Next run</label>
                  <input type="date" value={scheduleForm.nextRun} onChange={e => setScheduleForm({ ...scheduleForm, nextRun: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">Recipients</label>
                <input value={scheduleForm.recipients} onChange={e => setScheduleForm({ ...scheduleForm, recipients: e.target.value })} type="text" placeholder="hr-leads@eris.com, executives@eris.com" className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                <div className="mt-1 text-[11px] text-slate-400">Separate multiple recipients with commas.</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <Button variant="secondary" onClick={() => setShowSchedule(false)}>Cancel</Button>
              <Button variant="primary" disabled={!scheduleForm.nextRun || !scheduleForm.recipients.trim()} onClick={scheduleReport}>Save Schedule</Button>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
