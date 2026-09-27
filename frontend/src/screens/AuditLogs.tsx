import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, Input } from '../components/ui';
import { ScrollText, Search, Download, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  process: string;
  message: string;
  user: string;
  records: number | null;
}

const logs: LogEntry[] = [
  { id: 'ai-1', timestamp: '2026-09-24 10:32:11', level: 'INFO', process: 'Responsible AI Review', message: 'Human review required before retention decision. Employee risk explanation opened.', user: 'le.manager@eris.com', records: 1 },
  { id: 'ai-2', timestamp: '2026-09-24 10:29:47', level: 'SUCCESS', process: 'HR Copilot', message: 'Intervention suggestions generated. Output marked advisory and not auto-applied.', user: 'le.manager@eris.com', records: 1 },
  { id: 'ai-3', timestamp: '2026-09-24 09:58:20', level: 'WARN', process: 'Bias Monitoring', message: 'Sales and <2 years tenure segments flagged for fairness review.', user: 'system', records: 2 },
  { id: 'ai-4', timestamp: '2026-09-24 09:41:05', level: 'INFO', process: 'Escalation Workflow', message: 'High-risk intervention escalated to Director with reason, priority, and response deadline.', user: 'le.manager@eris.com', records: 1 },
  { id: '1', timestamp: '2026-09-23 04:05:03', level: 'ERROR', process: 'AI Feature Pipeline', message: 'Connection timeout to ML Feature Store. Pipeline aborted. Retry scheduled 04:35.', user: 'system', records: null },
  { id: '2', timestamp: '2026-09-23 04:05:02', level: 'WARN', process: 'AI Feature Pipeline', message: 'Partial data write — 0/1247 records committed to feature store.', user: 'system', records: 0 },
  { id: '3', timestamp: '2026-09-23 02:01:42', level: 'SUCCESS', process: 'HRIS Daily Sync', message: 'Sync completed successfully. 1,247 employee records updated.', user: 'system', records: 1247 },
  { id: '4', timestamp: '2026-09-23 02:00:11', level: 'INFO', process: 'HRIS Daily Sync', message: 'Pipeline initiated. Connecting to Workday HRIS endpoint.', user: 'system', records: null },
  { id: '5', timestamp: '2026-09-22 15:41:03', level: 'SUCCESS', process: 'Risk Analysis Run', message: 'Batch attrition analysis completed. 12 employees scored.', user: 'nguyen.data@eris.com', records: 12 },
  { id: '6', timestamp: '2026-09-22 15:40:58', level: 'INFO', process: 'Risk Analysis Run', message: 'Manual analysis triggered by user.', user: 'nguyen.data@eris.com', records: null },
  { id: '7', timestamp: '2026-09-22 10:12:31', level: 'INFO', process: 'Data Preparation', message: 'Feature engineering pipeline ran. 4,821 records processed.', user: 'nguyen.data@eris.com', records: 4821 },
  { id: '8', timestamp: '2026-09-21 03:02:18', level: 'SUCCESS', process: 'Payroll Sync', message: 'Payroll data import completed. 920 salary records updated.', user: 'system', records: 920 },
  { id: '9', timestamp: '2026-09-20 09:05:44', level: 'WARN', process: 'Schema Validation', message: '3 unmapped fields detected in Workday source (perf_rating_raw, open_text). Skipped.', user: 'system', records: 0 },
  { id: '10', timestamp: '2026-09-19 14:22:07', level: 'INFO', process: 'Model Evaluation', message: 'Model v2.3 evaluated on holdout set. AUC: 0.912, F1: 0.834.', user: 'nguyen.data@eris.com', records: 1000 },
];

const levelStyle: Record<LogLevel, { bg: string; text: string; icon: typeof CheckCircle }> = {
  SUCCESS: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  INFO: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Info },
  WARN: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle },
  ERROR: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle },
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.process.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !levelFilter || l.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <AppShell breadcrumb={['System & Logs', 'Processing Audit Logs']}>
      <SectionHeader title="Processing Audit Logs" description="System-wide processing events, pipeline runs, and data operations">
        <Button variant="secondary" size="sm" onClick={() => downloadTextFile('eris-audit-logs.csv', toCsv(filtered), 'text/csv;charset=utf-8')}><Download size={13} /> Export Logs</Button>
      </SectionHeader>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {(['SUCCESS', 'INFO', 'WARN', 'ERROR'] as LogLevel[]).map(level => {
          const count = logs.filter(l => l.level === level).length;
          const s = levelStyle[level];
          const Icon = s.icon;
          return (
            <Card key={level}
              className={`p-4 cursor-pointer transition-all ${levelFilter === level ? 'ring-1 ring-indigo-400' : ''}`}
              onClick={() => setLevelFilter(levelFilter === level ? '' : level)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={s.text} />
                <span className={`text-[12px] font-semibold ${s.text}`}>{level}</span>
              </div>
              <div className="text-[24px] font-semibold text-slate-900 leading-none">{count}</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-2 p-3 border-b border-slate-100">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search logs..."
            icon={<Search size={13} />}
            className="w-64"
          />
          {levelFilter && (
            <button onClick={() => setLevelFilter('')} className="text-[12px] text-slate-500 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded-[4px]">
              Clear filter
            </button>
          )}
          <div className="ml-auto text-[12px] text-slate-400">{filtered.length} entries</div>
        </div>

        {/* Terminal-style log view */}
        <div className="bg-slate-950 font-mono text-[12px]">
          {filtered.map(log => {
            const s = levelStyle[log.level];
            const Icon = s.icon;
            return (
              <div key={log.id} className={`flex items-start gap-3 px-4 py-2.5 border-b border-slate-800/60 hover:bg-slate-900/60 transition-colors`}>
                <span className="text-slate-500 flex-shrink-0 pt-0.5">{log.timestamp}</span>
                <span className={`flex items-center gap-1 flex-shrink-0 w-20 ${s.text}`}>
                  <Icon size={11} />
                  {log.level}
                </span>
                <span className="text-slate-400 w-36 flex-shrink-0 truncate">{log.process}</span>
                <span className="text-slate-200 flex-1">{log.message}</span>
                <span className="text-slate-600 flex-shrink-0">{log.user}</span>
                {log.records !== null && (
                  <span className="text-slate-500 flex-shrink-0">{log.records.toLocaleString()} rec</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
