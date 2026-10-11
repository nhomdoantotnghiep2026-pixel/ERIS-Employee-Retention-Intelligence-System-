import { AppShell } from '../components/AppShell';
import { Card, RiskBadge, SectionHeader, AIAdvisoryBanner } from '../components/ui';
import { employees } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, HeartPulse, Clock, CheckCircle } from 'lucide-react';

const myTeam = employees.slice(0, 6);
const pendingTasks = [
  { label: 'Schedule 1-on-1 with Nguyen Van A', due: 'Today', priority: 'High' },
  { label: 'Review action plan for Tran Thi B', due: 'Sep 25', priority: 'High' },
  { label: 'Send pulse survey reminder — Engineering', due: 'Sep 26', priority: 'Medium' },
];
const recentActivity = [
  { text: 'Risk score updated for Bui Thi I → 69%', time: '2h ago' },
  { text: 'Nguyen Thi F intervention marked Resolved', time: '1d ago' },
  { text: 'Q3 Pulse Survey results available', time: '2d ago' },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const highRisk = myTeam.filter(e => e.riskLevel === 'High');

  return (
    <AppShell breadcrumb={['Overview', 'Staff Dashboard']}>
      <SectionHeader title="Staff Dashboard" description="Your workforce snapshot for Sep 2026" />

      <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-[6px] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={17} className="text-red-500" />
          </div>
          <div>
            <div className="text-[24px] font-semibold text-red-600 leading-none">{highRisk.length}</div>
            <div className="text-[12px] text-slate-500 mt-0.5">High-risk employees</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-[6px] flex items-center justify-center flex-shrink-0">
            <ClipboardList size={17} className="text-amber-500" />
          </div>
          <div>
            <div className="text-[24px] font-semibold text-amber-600 leading-none">3</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Interventions pending</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 rounded-[6px] flex items-center justify-center flex-shrink-0">
            <HeartPulse size={17} className="text-violet-500" />
          </div>
          <div>
            <div className="text-[24px] font-semibold text-violet-700 leading-none">83%</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Survey response rate</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Pending tasks */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold text-slate-800">Pending Tasks</div>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-[5px]">
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.priority === 'High' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-slate-700">{t.label}</div>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                    <Clock size={10} /> {t.due}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${t.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-4">
          <div className="text-[14px] font-semibold text-slate-800 mb-3">Recent Activity</div>
          <div className="space-y-2.5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={11} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-[13px] text-slate-700">{a.text}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* My team quick table */}
      <Card>
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-slate-800">My Team</div>
        </div>
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[20%]" />
            <col className="w-[32%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Employee', 'Department', 'Role', 'Risk'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myTeam.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => navigate(`/employees/${emp.id}`)}>
                <td className="px-4 h-[44px]">
                  <div className="text-[13px] font-medium text-slate-800">{emp.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{emp.employeeId}</div>
                </td>
                <td className="px-4 h-[44px] text-[13px] text-slate-600">{emp.department}</td>
                <td className="px-4 h-[44px] text-[13px] text-slate-600">{emp.role}</td>
                <td className="px-4 h-[44px]"><RiskBadge level={emp.riskLevel} score={emp.riskScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
