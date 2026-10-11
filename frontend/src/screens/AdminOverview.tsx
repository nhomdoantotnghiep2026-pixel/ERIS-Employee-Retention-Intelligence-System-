import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, StatusBadge } from '../components/ui';
import { users, activityLog } from '../data/mockData';
import { CheckCircle, Database, Cpu, FileText, Settings } from 'lucide-react';

export default function AdminOverview() {
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  return (
    <AppShell>
      <SectionHeader
        title="Administration Overview"
        description="System status, user accounts, and recent operational activity."
      />

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Total Users</div>
            <div className="text-[24px] font-semibold text-gray-900">{users.length}</div>
            <div className="text-[12px] text-gray-400">{activeUsers} active · {inactiveUsers} inactive</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">System Roles</div>
            <div className="text-[24px] font-semibold text-gray-900">4</div>
            <div className="text-[12px] text-gray-400">HR Staff, Manager, Analyst, Admin</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">System Status</div>
            <div className="text-[24px] font-semibold text-green-600">All OK</div>
            <div className="text-[12px] text-gray-400">All services operational</div>
          </Card>
          <Card className="px-5 py-3.5">
            <div className="text-[12px] text-gray-500 mb-1">Activities Today</div>
            <div className="text-[24px] font-semibold text-gray-900">48</div>
            <div className="text-[12px] text-gray-400">0 errors</div>
          </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        {/* Service status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold text-gray-800">Service Status</div>
          </div>
          <div className="space-y-0">
            {[
              { label: 'Application', icon: <Settings size={13} className="text-green-500" />, status: 'Operational' },
              { label: 'Database', icon: <Database size={13} className="text-green-500" />, status: 'Connected' },
              { label: 'AI Analysis Service', icon: <Cpu size={13} className="text-green-500" />, status: 'Operational' },
              { label: 'Reporting Service', icon: <FileText size={13} className="text-green-500" />, status: 'Operational' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-[13px] text-gray-700">{s.label}</span>
                </div>
                <span className="text-[12px] font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle size={11} /> {s.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Users summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold text-gray-800">Users</div>
          </div>
          <div className="space-y-0">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-[13px] font-medium text-gray-800">{u.name}</div>
                  <div className="text-[11px] text-gray-400">{u.role}</div>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Administration status */}
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-gray-800 mb-3">Administration</div>
          <div className="space-y-1.5">
            {[
              { label: 'Users Management', value: `${users.length} accounts` },
              { label: 'Roles & Permissions', value: '4 roles' },
              { label: 'System Configuration', value: 'Configured' },
              { label: 'System Activity Log', value: '48 today' },
            ].map(a => (
              <div
                key={a.label}
                className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-gray-700 bg-slate-50 border border-gray-200"
                style={{ borderRadius: '5px' }}
              >
                <span>{a.label}</span>
                <span className="text-[12px] font-medium text-slate-600">{a.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[14px] font-medium text-gray-800">Recent Activity</span>
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
            {activityLog.slice(0, 5).map((a, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-3 h-[44px] font-mono text-[12px] text-gray-400 whitespace-nowrap">{a.time}</td>
                <td className="px-3 h-[44px] text-[13px] font-medium text-gray-800">{a.user}</td>
                <td className="px-3 h-[44px] text-[13px] text-gray-600">{a.activity}</td>
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
