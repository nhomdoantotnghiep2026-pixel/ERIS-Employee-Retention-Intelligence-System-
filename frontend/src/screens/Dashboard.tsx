import { AlertTriangle, ArrowRight, BriefcaseBusiness, CheckCircle2, ClipboardList, MessageSquare, Target, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AIAdvisoryBanner, Card, RiskBadge } from '../components/ui';
import { departments } from '../data/mockData';
import { useEmployees } from '../context/EmployeeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';

function WidgetTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 className="text-base font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>{action}</div>;
}

export default function Dashboard() {
  const { employees } = useEmployees();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useRole();
  const addedEmployees = Math.max(0, employees.length - 12);
  const total = 1248 + addedEmployees;
  const high = 126;
  const medium = 312;
  const low = 810 + addedEmployees;
  const priority = employees.filter(employee => employee.riskLevel === 'High').sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, to: '/employees/new', tone: 'bg-violet-100 text-violet-600' },
    { label: 'Employee List', icon: Users, to: '/employees', tone: 'bg-blue-100 text-blue-600' },
    { label: 'Risk Review', icon: AlertTriangle, to: '/attrition-risk', tone: 'bg-red-100 text-red-600' },
    { label: 'Interventions', icon: Target, to: '/interventions', tone: 'bg-orange-100 text-orange-600' },
    { label: 'Survey', icon: MessageSquare, to: '/engagement', tone: 'bg-emerald-100 text-emerald-600' },
    { label: 'Reports', icon: ClipboardList, to: '/executive-reports', tone: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <AppShell breadcrumb={['Dashboard']}>
      <section className="mb-5 overflow-hidden rounded-[24px] p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] sm:p-7" style={{ background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 58%, #334155 100%)' }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">{t('Workforce overview')}</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('Good morning')}, {user.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t('Here is what needs your attention across employee retention and engagement today.')}</p></div>
          <button onClick={() => navigate('/employees')} className="flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{t('Review employees')}<ArrowRight size={17} /></button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <WidgetTitle title={t('Employee risk overview')} description={t('Current workforce retention profile')} action={<button onClick={() => navigate('/attrition-risk')} className="text-xs font-bold text-orange-600 hover:underline">{t('View analytics')} →</button>} />
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
              {[{ label: 'Total employees', value: total, icon: Users, color: 'text-slate-700', bg: 'bg-slate-100' }, { label: 'High risk', value: high, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }, { label: 'Medium risk', value: medium, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Low risk', value: low, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }].map(item => <div key={item.label} className="bg-white p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg} ${item.color}`}><item.icon size={18} /></span><p className="mt-4 text-3xl font-extrabold tabular-nums text-slate-900">{item.value}</p><p className="mt-1 text-xs font-medium text-slate-500">{t(item.label)}</p></div>)}
            </div>
            <div className="px-5 py-5"><div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>{t('Risk distribution')}</span><span>{total} {t('employees')}</span></div><div className="flex h-3 overflow-hidden rounded-full bg-slate-100"><span className="bg-red-500" style={{ width: `${high / total * 100}%` }} /><span className="bg-amber-400" style={{ width: `${medium / total * 100}%` }} /><span className="bg-emerald-500" style={{ width: `${low / total * 100}%` }} /></div><div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />{t('High risk')}</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />{t('Medium risk')}</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />{t('Low risk')}</span></div></div>
          </Card>

          <Card className="overflow-hidden">
            <WidgetTitle title={t('Employees needing attention')} description={t('Highest retention risk scores this week')} action={<button onClick={() => navigate('/employees')} className="text-xs font-bold text-orange-600 hover:underline">{t('View all')} →</button>} />
            <div className="divide-y divide-slate-100">
              {priority.map(employee => <button key={employee.id} onClick={() => navigate(`/employees/${employee.id}`, { state: { returnTo: '/dashboard' } })} className="flex min-h-[72px] w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-orange-50/70"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-bold text-orange-700">{employee.initials}</span><span className="min-w-0 flex-1"><b className="block truncate text-sm text-slate-900">{employee.name}</b><span className="mt-0.5 block truncate text-xs text-slate-500">{t(employee.department)} · {t(employee.role)}</span></span><RiskBadge level={employee.riskLevel} score={employee.riskScore} /><ArrowRight size={16} className="text-slate-300" /></button>)}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <WidgetTitle title={t('Quick Launch')} description={t('Frequently used HR tools')} />
            <div className="grid grid-cols-3 gap-y-6 p-5">
              {quickActions.map(action => <button key={action.label} onClick={() => navigate(action.to)} className="group flex min-h-[92px] flex-col items-center justify-start gap-2 rounded-2xl px-2 py-2 text-center hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-500"><span className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${action.tone}`}><action.icon size={21} /></span><span className="text-[11px] font-semibold leading-4 text-slate-700">{t(action.label)}</span></button>)}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <WidgetTitle title={t('Department signals')} description={t('High-risk ratio by department')} />
            <div className="space-y-4 p-5">
              {[...departments].sort((a, b) => b.highRisk / b.employees - a.highRisk / a.employees).slice(0, 5).map(department => { const percentage = Math.round(department.highRisk / department.employees * 100); return <button key={department.name} onClick={() => navigate('/org-overview')} className="block w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-orange-500"><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">{t(department.name)}</span><span className="font-bold text-slate-900">{percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percentage > 20 ? 'bg-red-500' : percentage > 12 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percentage * 3, 100)}%` }} /></div></button>; })}
            </div>
          </Card>

          <Card className="flex items-center gap-4 bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20"><BriefcaseBusiness size={23} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-orange-100">{t('Active interventions')}</p><p className="mt-1 text-2xl font-extrabold">3</p></div><button onClick={() => navigate('/interventions')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-600 hover:bg-orange-50" aria-label={t('View interventions')}><ArrowRight size={18} /></button>
          </Card>
        </div>
      </div>

      <div className="mt-5"><AIAdvisoryBanner /></div>
    </AppShell>
  );
}
