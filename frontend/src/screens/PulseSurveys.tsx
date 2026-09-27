import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, AIAdvisoryBanner } from '../components/ui';
import { HeartPulse, Send, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { useState } from 'react';

const activeSurveys = [
  { title: 'Q3 2026 Engagement Pulse', sent: 48, responded: 39, due: 'Sep 28, 2026', status: 'Active' },
  { title: 'Post-Intervention Check-In', sent: 4, responded: 2, due: 'Sep 30, 2026', status: 'Active' },
];

const completedSurveys = [
  { title: 'Q2 2026 Engagement Pulse', sent: 46, responded: 41, responseRate: 89, avgScore: 3.4, date: 'Jun 2026' },
  { title: 'Q1 2026 Engagement Pulse', sent: 44, responded: 40, responseRate: 91, avgScore: 3.7, date: 'Mar 2026' },
  { title: 'Q4 2025 Engagement Pulse', sent: 42, responded: 36, responseRate: 86, avgScore: 3.5, date: 'Dec 2025' },
];

const quickScores = [
  { label: 'Morale', score: 3.1, max: 5, trend: 'down' },
  { label: 'Workload', score: 2.7, max: 5, trend: 'down' },
  { label: 'Management', score: 3.6, max: 5, trend: 'up' },
  { label: 'Team Cohesion', score: 3.9, max: 5, trend: 'stable' },
];

export default function PulseSurveys() {
  const [surveys, setSurveys] = useState(activeSurveys);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const sendNewSurvey = () => {
    setSurveys(rows => [{ title: `Pulse Check ${new Date().toLocaleDateString()}`, sent: 12, responded: 0, due: 'Oct 7, 2026', status: 'Active' }, ...rows]);
  };
  const sendReminder = (title: string) => {
    setSurveys(rows => rows.map(row => row.title === title ? { ...row, responded: Math.min(row.sent, row.responded + 1) } : row));
  };

  return (
    <AppShell breadcrumb={['Engagement', 'Pulse Surveys']}>
      <SectionHeader title="Pulse Surveys" description="Short-cycle engagement check-ins for your team">
        <Button variant="primary" size="sm" onClick={sendNewSurvey}><Send size={13} /> Send New Survey</Button>
      </SectionHeader>

      {/* Quick scores */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {quickScores.map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 mb-1">{s.label}</div>
            <div className={`text-[24px] font-semibold font-mono leading-none ${s.score < 3 ? 'text-red-600' : s.score < 3.5 ? 'text-amber-600' : 'text-green-600'}`}>
              {s.score}<span className="text-[12px] font-normal text-slate-400">/{s.max}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {s.trend === 'down' ? <TrendingDown size={11} className="text-red-400" /> : s.trend === 'up' ? <TrendingUp size={11} className="text-green-500" /> : <span className="text-slate-300 text-[10px]">→</span>}
              <span className="text-[10px] text-slate-400">{s.trend === 'down' ? 'Declining' : s.trend === 'up' ? 'Improving' : 'Stable'}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Active surveys */}
      <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">Active Surveys</div>
      <div className="space-y-3 mb-5">
        {surveys.map(s => {
          const pct = Math.round(s.responded / s.sent * 100);
          return (
            <Card key={s.title} className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <HeartPulse size={14} className="text-violet-500" />
                    <span className="text-[14px] font-semibold text-slate-800">{s.title}</span>
                    <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-slate-400">
                    <Clock size={11} /> Due {s.due}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[20px] font-semibold font-mono text-indigo-700">{pct}%</div>
                  <div className="text-[11px] text-slate-400">{s.responded}/{s.sent} responded</div>
                </div>
              </div>
              <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="secondary" size="sm" onClick={() => sendReminder(s.title)}><Send size={12} /> Send Reminder</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(selectedResult === s.title ? null : s.title)}>View Results</Button>
              </div>
              {selectedResult === s.title && (
                <div className="mt-3 rounded bg-slate-50 p-3 text-[12px] text-slate-600">
                  Current response rate is {pct}%. Top concern in latest responses: workload balance.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Completed */}
      <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">Survey History</div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Survey', 'Period', 'Sent', 'Responded', 'Response Rate', 'Avg Score'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {completedSurveys.map(s => (
              <tr key={s.title} className="hover:bg-slate-50/60">
                <td className="px-4 h-[48px] text-[13px] font-medium text-slate-800">{s.title}</td>
                <td className="px-4 h-[48px] text-[13px] text-slate-500">{s.date}</td>
                <td className="px-4 h-[48px] font-mono text-[13px] text-slate-600">{s.sent}</td>
                <td className="px-4 h-[48px] font-mono text-[13px] text-slate-600">{s.responded}</td>
                <td className="px-4 h-[48px]">
                  <span className={`font-mono text-[13px] font-semibold ${s.responseRate >= 85 ? 'text-green-600' : 'text-amber-600'}`}>{s.responseRate}%</span>
                </td>
                <td className="px-4 h-[48px]">
                  <span className={`font-mono text-[13px] font-semibold ${s.avgScore >= 3.5 ? 'text-green-600' : s.avgScore >= 3.0 ? 'text-amber-600' : 'text-red-600'}`}>{s.avgScore}</span>
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
