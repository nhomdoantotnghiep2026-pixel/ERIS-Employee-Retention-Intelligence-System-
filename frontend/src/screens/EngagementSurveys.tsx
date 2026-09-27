import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, Tabs, AIAdvisoryBanner } from '../components/ui';
import { useState } from 'react';
import { departments } from '../data/mockData';
import { MessageSquare, TrendingDown, TrendingUp } from 'lucide-react';
import { downloadTextFile, toCsv } from '../utils/demoActions';

const surveyMetrics = [
  { label: 'Overall Engagement', score: 3.2, max: 5, trend: 'down', prev: 3.5, color: 'text-amber-600' },
  { label: 'Job Satisfaction', score: 2.9, max: 5, trend: 'down', prev: 3.1, color: 'text-red-600' },
  { label: 'Work-Life Balance', score: 2.6, max: 4, trend: 'down', prev: 2.9, color: 'text-red-600' },
  { label: 'Manager Relationship', score: 3.4, max: 5, trend: 'up', prev: 3.2, color: 'text-amber-600' },
  { label: 'Environment Satisfaction', score: 3.1, max: 5, trend: 'stable', prev: 3.1, color: 'text-amber-600' },
  { label: 'Career Growth', score: 2.7, max: 5, trend: 'down', prev: 3.0, color: 'text-red-600' },
];

const surveyHistory = [
  { period: 'Q3 2026', sent: 240, responded: 198, responseRate: 83, avg: 3.2 },
  { period: 'Q2 2026', sent: 235, responded: 182, responseRate: 77, avg: 3.4 },
  { period: 'Q1 2026', sent: 228, responded: 201, responseRate: 88, avg: 3.6 },
  { period: 'Q4 2025', sent: 215, responded: 190, responseRate: 88, avg: 3.5 },
];

const deptScores = departments.map(d => ({
  name: d.name,
  score: parseFloat((3.8 - d.avgRisk / 40).toFixed(1)),
  trend: d.trend,
}));

export default function EngagementSurveys() {
  const [tab, setTab] = useState('Overview');
  const [history, setHistory] = useState(surveyHistory);

  const exportData = () => {
    const rows = tab === 'By Department'
      ? deptScores.map(row => ({ department: row.name, score: row.score, trend: row.trend }))
      : tab === 'Survey History'
        ? history
        : surveyMetrics.map(row => ({ metric: row.label, score: row.score, max: row.max, trend: row.trend, previous: row.prev }));
    downloadTextFile(`engagement-${tab.toLowerCase().replace(/\s+/g, '-')}.csv`, toCsv(rows), 'text/csv;charset=utf-8');
  };

  const launchSurvey = () => {
    setHistory(rows => [
      { period: `Pulse ${new Date().toLocaleDateString()}`, sent: 12, responded: 0, responseRate: 0, avg: 0 },
      ...rows,
    ]);
    setTab('Survey History');
  };

  return (
    <AppShell breadcrumb={['Performance & Retention', 'Engagement Surveys']}>
      <SectionHeader title="Engagement Surveys" description="Employee satisfaction scores and survey analytics">
        <Button variant="secondary" size="sm" onClick={exportData}>Export Data</Button>
        <Button variant="primary" size="sm" onClick={launchSurvey}><MessageSquare size={13} /> Launch Survey</Button>
      </SectionHeader>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {surveyMetrics.slice(0, 3).map(m => (
          <Card key={m.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{m.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${m.color}`}>
              {m.score}<span className="text-[14px] font-normal text-slate-400">/{m.max}</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {m.trend === 'down' ? <TrendingDown size={12} className="text-red-400" /> : m.trend === 'up' ? <TrendingUp size={12} className="text-green-500" /> : null}
              <span className="text-[11px] text-slate-400">vs {m.prev} last quarter</span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs tabs={['Overview', 'By Department', 'Survey History']} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-[14px] font-semibold text-slate-800 mb-4">All Satisfaction Metrics</div>
            <div className="space-y-3">
              {surveyMetrics.map(m => {
                const pct = (m.score / m.max) * 100;
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-slate-600">{m.label}</span>
                      <span className={`text-[13px] font-semibold font-mono ${m.color}`}>{m.score}/{m.max}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct < 55 ? 'bg-red-400' : pct < 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[14px] font-semibold text-slate-800 mb-4">Latest Survey: Q3 2026</div>
            {[
              { label: 'Surveys Sent', value: '240' },
              { label: 'Responses Received', value: '198' },
              { label: 'Response Rate', value: '83%' },
              { label: 'Average Score', value: '3.2 / 5.0' },
              { label: 'Survey Period', value: 'Jul – Sep 2026' },
              { label: 'Next Survey', value: 'Dec 1, 2026' },
            ].map(row => (
              <div key={row.label} className="flex items-center py-2 border-b border-slate-100 last:border-0">
                <span className="w-44 text-[13px] text-slate-500">{row.label}</span>
                <span className="text-[13px] font-medium text-slate-800">{row.value}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === 'By Department' && (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Department', 'Avg Score', 'Job Satisfaction', 'Work-Life Balance', 'Manager Relationship', 'Trend'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {deptScores.map(d => (
                <tr key={d.name} className="hover:bg-slate-50/60">
                  <td className="px-4 h-[48px] text-[13px] font-medium text-slate-800">{d.name}</td>
                  <td className="px-4 h-[48px] font-mono text-[13px] font-semibold text-slate-700">{d.score}</td>
                  <td className="px-4 h-[48px]">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${i <= Math.round(d.score) ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 h-[48px]">
                    <div className="flex gap-0.5">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${i <= Math.round(d.score - 0.3) ? 'bg-indigo-400' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 h-[48px]">
                    <span className="font-mono text-[13px] text-slate-600">{(d.score + 0.2).toFixed(1)}</span>
                  </td>
                  <td className="px-4 h-[48px]">
                    {d.trend === 'down' ? <TrendingDown size={14} className="text-red-400" /> : d.trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> : <span className="text-slate-300 text-[11px]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Survey History' && (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Period', 'Surveys Sent', 'Responses', 'Response Rate', 'Avg Score'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(row => (
                <tr key={row.period} className="hover:bg-slate-50/60">
                  <td className="px-4 h-[48px] text-[13px] font-semibold text-slate-800">{row.period}</td>
                  <td className="px-4 h-[48px] font-mono text-[13px] text-slate-600">{row.sent}</td>
                  <td className="px-4 h-[48px] font-mono text-[13px] text-slate-600">{row.responded}</td>
                  <td className="px-4 h-[48px]">
                    <span className={`font-mono text-[13px] font-semibold ${row.responseRate >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{row.responseRate}%</span>
                  </td>
                  <td className="px-4 h-[48px]">
                    <span className={`font-mono text-[13px] font-semibold ${row.avg >= 3.5 ? 'text-green-600' : row.avg >= 3.0 ? 'text-amber-600' : 'text-red-600'}`}>{row.avg}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
