import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock, HeartPulse, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AIAdvisoryBanner, Card, RiskBadge } from '../components/ui';
import { useEmployees } from '../context/EmployeeContext';
import { useLanguage } from '../context/LanguageContext';

const tasks = [
  { label: 'Schedule 1-on-1 with Nguyen Van A', due: 'Today', priority: 'High', to: '/retention-tasks' },
  { label: 'Review action plan for Tran Thi B', due: 'Sep 25', priority: 'High', to: '/retention-tasks' },
  { label: 'Send pulse survey reminder — Engineering', due: 'Sep 26', priority: 'Medium', to: '/pulse-surveys' },
];

export default function StaffDashboard() {
  const { employees } = useEmployees();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const team = employees.slice(0, 6);
  const highRisk = team.filter(employee => employee.riskLevel === 'High');
  const actions = [
    { label: 'Employee Directory', icon: Users, to: '/employees', tone: 'bg-blue-100 text-blue-600' },
    { label: 'Risk Monitor', icon: AlertTriangle, to: '/staff-risk-monitor', tone: 'bg-red-100 text-red-600' },
    { label: 'Retention Tasks', icon: ClipboardList, to: '/retention-tasks', tone: 'bg-orange-100 text-orange-600' },
    { label: 'Pulse Surveys', icon: HeartPulse, to: '/pulse-surveys', tone: 'bg-violet-100 text-violet-600' },
  ];

  return <AppShell breadcrumb={['My Workspace']}>
    <section className="mb-5 flex flex-col gap-5 rounded-[24px] bg-white p-6 shadow-[0_8px_28px_rgba(30,41,59,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">{t('HR Operations')}</p><h1 className="mt-2 text-2xl font-extrabold text-slate-900">{t('My work queue')}</h1><p className="mt-2 text-sm text-slate-500">{t('Handle priority employee follow-ups and engagement tasks for today.')}</p></div>
      <button onClick={() => navigate('/retention-tasks')} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600">{t('Open task list')}<ArrowRight size={17} /></button>
    </section>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
      <div className="space-y-5">
        <Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{t('Actions requiring attention')}</h2><p className="mt-1 text-xs text-slate-500">{t('Ordered by urgency and due date')}</p></div><div className="divide-y divide-slate-100">{tasks.map(task => <button key={task.label} onClick={() => navigate(task.to)} className="flex min-h-[76px] w-full items-center gap-3 px-5 text-left hover:bg-orange-50"><span className={`h-3 w-3 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-400'}`} /><span className="min-w-0 flex-1"><b className="block truncate text-sm text-slate-800">{t(task.label)}</b><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock size={12} />{t(task.due)}</span></span><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{t(task.priority)}</span><ArrowRight size={16} className="text-slate-300" /></button>)}</div></Card>
        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">{t('Employees to monitor')}</h2><p className="mt-1 text-xs text-slate-500">{t('Your current team view')}</p></div><button onClick={() => navigate('/employees')} className="text-xs font-bold text-orange-600">{t('View all')} →</button></div><div className="divide-y divide-slate-100">{team.slice(0, 4).map(employee => <button key={employee.id} onClick={() => navigate(`/employees/${employee.id}`)} className="flex min-h-[68px] w-full items-center gap-3 px-5 text-left hover:bg-orange-50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{employee.initials}</span><span className="min-w-0 flex-1"><b className="block truncate text-sm text-slate-800">{employee.name}</b><span className="text-xs text-slate-500">{t(employee.department)}</span></span><RiskBadge level={employee.riskLevel} score={employee.riskScore} /></button>)}</div></Card>
      </div>
      <div className="space-y-5">
        <Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{t('Quick Access')}</h2></div><div className="grid grid-cols-2 gap-3 p-5">{actions.map(action => <button key={action.label} onClick={() => navigate(action.to)} className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 p-3 text-center hover:bg-orange-50"><span className={`flex h-12 w-12 items-center justify-center rounded-full ${action.tone}`}><action.icon size={21} /></span><span className="text-xs font-bold text-slate-700">{t(action.label)}</span></button>)}</div></Card>
        <Card className="p-5"><h2 className="font-bold text-slate-900">{t('Today at a glance')}</h2><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-red-50 p-3"><b className="block text-2xl text-red-600">{highRisk.length}</b><span className="text-[10px] text-red-700">{t('High risk')}</span></div><div className="rounded-2xl bg-orange-50 p-3"><b className="block text-2xl text-orange-600">3</b><span className="text-[10px] text-orange-700">{t('Tasks')}</span></div><div className="rounded-2xl bg-emerald-50 p-3"><b className="block text-2xl text-emerald-600">83%</b><span className="text-[10px] text-emerald-700">{t('Survey')}</span></div></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><CheckCircle2 size={16} />{t('All assigned records are synchronized.')}</div></Card>
      </div>
    </div>
    <div className="mt-5"><AIAdvisoryBanner /></div>
  </AppShell>;
}
