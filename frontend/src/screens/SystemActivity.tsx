import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, StatusBadge } from '../components/ui';
import { activityLog } from '../data/mockData';

const governanceActivity = [
  { time: '10:32 AM', user: 'Le Thi Manager', activity: 'Opened AI explanation for high-risk employee', module: 'Responsible AI', status: 'Success' },
  { time: '10:29 AM', user: 'Le Thi Manager', activity: 'Generated HR Copilot intervention draft', module: 'HR Copilot', status: 'Success' },
  { time: '09:58 AM', user: 'system', activity: 'Fairness monitoring flagged 2 workforce segments', module: 'AI Governance', status: 'Warning' },
  { time: '09:41 AM', user: 'Le Thi Manager', activity: 'Escalated intervention to Director with deadline', module: 'Escalation', status: 'Success' },
];

export default function SystemActivity() {
  return (
    <AppShell breadcrumb={['System Activity']}>
      <SectionHeader title="System Activity" description="Review recent activity across the ERIS platform." />

      {/* Summary */}
      <Card className="mb-4 overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 xl:grid-cols-4 xl:divide-y-0">
          {[
            { label: 'Activities Today', value: '48' },
            { label: 'Active Users (24h)', value: '12' },
            { label: 'Analysis Runs Today', value: '3' },
            { label: 'Errors (24h)', value: '0' },
          ].map(m => (
            <div key={m.label} className="px-5 py-3.5">
              <div className="text-[12px] text-gray-500 mb-1">{m.label}</div>
              <div className="text-[24px] font-semibold text-gray-900">{m.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="px-4 py-2.5 border-b border-gray-200">
          <span className="text-[14px] font-medium text-gray-800">Activity Log</span>
          <span className="text-[12px] text-gray-400 ml-2">Today, Sep 22, 2026</span>
        </div>
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[42%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Time', 'User', 'Activity', 'Module', 'Status'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...governanceActivity, ...activityLog].map((a, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-3 h-[44px] font-mono text-[12px] text-gray-400 whitespace-nowrap">{a.time}</td>
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{a.user}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">
                  <span className="line-clamp-2">{a.activity}</span>
                </td>
                <td className="px-3 h-[44px]">
                  <span className="text-[12px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{a.module}</span>
                </td>
                <td className="px-3 h-[44px]"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
