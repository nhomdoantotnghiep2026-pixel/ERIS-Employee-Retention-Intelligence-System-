import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button, RiskBadge } from '../components/ui';
import { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';

type TaskStatus = 'Pending' | 'In Progress' | 'Done';
type Priority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;
  title: string;
  employee: string;
  empId: string;
  dept: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  type: string;
  due: string;
  status: TaskStatus;
  priority: Priority;
}

const tasks: Task[] = [
  { id: '1', title: 'Schedule 1-on-1 meeting', employee: 'Nguyen Van A', empId: '1', dept: 'Engineering', riskLevel: 'High', type: '1-on-1', due: 'Sep 25, 2026', status: 'Pending', priority: 'High' },
  { id: '2', title: 'Review and update action plan', employee: 'Tran Thi B', empId: '2', dept: 'Sales', riskLevel: 'High', type: 'Action Plan', due: 'Sep 25, 2026', status: 'In Progress', priority: 'High' },
  { id: '3', title: 'Submit salary review request to HR Manager', employee: 'Tran Thi B', empId: '2', dept: 'Sales', riskLevel: 'High', type: 'Escalation', due: 'Sep 26, 2026', status: 'Pending', priority: 'High' },
  { id: '4', title: 'Check-in call — workload discussion', employee: 'Bui Thi I', empId: '9', dept: 'Engineering', riskLevel: 'High', type: '1-on-1', due: 'Sep 28, 2026', status: 'Pending', priority: 'Medium' },
  { id: '5', title: 'Send engagement survey link', employee: 'Nguyen Thi F', empId: '6', dept: 'Marketing', riskLevel: 'High', type: 'Survey', due: 'Sep 30, 2026', status: 'Done', priority: 'Medium' },
  { id: '6', title: 'Mentorship program enrollment', employee: 'Le Van C', empId: '3', dept: 'Operations', riskLevel: 'Medium', type: 'Development', due: 'Oct 3, 2026', status: 'Pending', priority: 'Low' },
];

const statusConfig: Record<TaskStatus, { icon: typeof Clock; label: string; style: string }> = {
  Pending: { icon: Circle, label: 'Pending', style: 'text-slate-400' },
  'In Progress': { icon: Clock, label: 'In Progress', style: 'text-blue-600' },
  Done: { icon: CheckCircle, label: 'Done', style: 'text-green-600' },
};

const priorityStyle: Record<Priority, string> = {
  High: 'bg-red-50 text-red-600 border-red-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function RetentionTasks() {
  const [taskRows, setTaskRows] = useState(tasks);
  const [filter, setFilter] = useState<TaskStatus | 'All'>('All');
  const filtered = filter === 'All' ? taskRows : taskRows.filter(t => t.status === filter);
  const counts = { All: taskRows.length, Pending: taskRows.filter(t => t.status === 'Pending').length, 'In Progress': taskRows.filter(t => t.status === 'In Progress').length, Done: taskRows.filter(t => t.status === 'Done').length };
  const addTask = () => {
    setTaskRows(rows => [{ id: `task-${Date.now()}`, title: 'New retention follow-up', employee: 'Nguyen Van A', empId: '1', dept: 'Engineering', riskLevel: 'High', type: 'Follow-up', due: 'Oct 5, 2026', status: 'Pending', priority: 'Medium' }, ...rows]);
    setFilter('All');
  };
  const advanceStatus = (id: string) => {
    const next: Record<TaskStatus, TaskStatus> = { Pending: 'In Progress', 'In Progress': 'Done', Done: 'Pending' };
    setTaskRows(rows => rows.map(task => task.id === id ? { ...task, status: next[task.status] } : task));
  };

  return (
    <AppShell breadcrumb={['Workforce Management', 'Retention Tasks']}>
      <SectionHeader title="Retention Tasks" description="Your assigned retention actions and follow-ups">
        <Button variant="primary" size="sm" onClick={addTask}><Plus size={13} /> Add Task</Button>
      </SectionHeader>

      {/* Filter bar */}
      <div className="flex items-center gap-1.5 mb-4">
        {(['All', 'Pending', 'In Progress', 'Done'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 h-[30px] text-[13px] font-medium rounded-[5px] border transition-colors ${filter === s ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s}
            <span className={`ml-1.5 text-[11px] font-semibold ${filter === s ? 'text-indigo-200' : 'text-slate-400'}`}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(task => {
          const S = statusConfig[task.status];
          const Icon = S.icon;
          return (
            <Card key={task.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button aria-label={`Update status for ${task.title}`} onClick={() => advanceStatus(task.id)} className={`flex-shrink-0 ${S.style}`}>
                  <Icon size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-800">{task.title}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${priorityStyle[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[12px] text-slate-500">
                    <span>{task.employee}</span>
                    <span>·</span>
                    <span>{task.dept}</span>
                    <span>·</span>
                    <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{task.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <RiskBadge level={task.riskLevel} />
                  <div className="flex items-center gap-1 text-[12px] text-slate-400">
                    <Clock size={11} /> {task.due}
                  </div>
                  <span className={`text-[12px] font-medium ${S.style}`}>{S.label}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
          <div className="text-[14px]">No tasks in this category</div>
        </div>
      )}
    </AppShell>
  );
}
