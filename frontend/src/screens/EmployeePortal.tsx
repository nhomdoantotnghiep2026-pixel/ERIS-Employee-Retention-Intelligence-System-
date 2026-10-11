import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock3, HeartPulse, IdCard, LogIn, LogOut, Send } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Avatar, Button, Card, SectionHeader } from '../components/ui';
import { useEmployees } from '../context/EmployeeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';

export type EmployeePortalMode = 'dashboard' | 'profile' | 'attendance' | 'surveys';
type AttendanceState = { date: string; checkIn?: string; checkOut?: string };

function todayLabel() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
}

function currentTime() {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

export default function EmployeePortal({ mode }: { mode: EmployeePortalMode }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { user } = useRole();
  const employee = employees.find(item => item.email.toLowerCase() === user.email.toLowerCase() || item.name === user.name) || employees[0];
  const [attendance, setAttendance] = useState<AttendanceState>(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('eris-my-attendance') || '{}') as AttendanceState;
      return stored.date === todayLabel() ? stored : { date: todayLabel() };
    } catch { return { date: todayLabel() }; }
  });
  const [answers, setAnswers] = useState({ satisfaction: '', workload: '', comment: '' });
  const [surveyDone, setSurveyDone] = useState(() => sessionStorage.getItem('eris-survey-q4-2026') === 'submitted');

  const saveAttendance = (next: AttendanceState) => { setAttendance(next); sessionStorage.setItem('eris-my-attendance', JSON.stringify(next)); };
  const checkIn = () => saveAttendance({ date: todayLabel(), checkIn: currentTime() });
  const checkOut = () => saveAttendance({ ...attendance, date: todayLabel(), checkOut: currentTime() });

  if (mode === 'profile') return <AppShell breadcrumb={['Self Service', 'My Profile']}><SectionHeader title="My Profile" description="Review your personal and employment information."/><Card className="p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><Avatar initials={employee.initials} size="lg"/><div><h2 className="text-xl font-bold text-slate-900">{employee.name}</h2><p className="mt-1 text-sm text-slate-500">{employee.employeeId} · {t(employee.role)}</p></div></div><dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">{[['Email',employee.email],['Department',t(employee.department)],['Employment status',t(employee.status)],['Job level',`Level ${employee.jobLevel}`],['Tenure',`${employee.tenure} years`],['Business travel',t(employee.businessTravel)]].map(([label,value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{t(label)}</dt><dd className="mt-2 text-sm font-semibold text-slate-800">{value}</dd></div>)}</dl><p className="mt-5 text-xs leading-5 text-slate-500">{t('Contact HR if any information is incorrect. Employee records are read-only in self service.')}</p></Card></AppShell>;

  if (mode === 'attendance') return <AppShell breadcrumb={['Self Service', 'My Attendance']}><SectionHeader title="My Attendance" description="Record your working day and review today’s attendance status."/><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><Card className="p-6"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Clock3 size={23}/></span><div><h2 className="font-bold text-slate-900">{todayLabel()}</h2><p className="text-sm text-slate-500">{attendance.checkOut ? t('Workday completed') : attendance.checkIn ? t('Currently checked in') : t('Not checked in')}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-5"><p className="text-xs font-bold uppercase text-emerald-700">{t('Check-in')}</p><p className="mt-2 text-2xl font-extrabold text-emerald-800">{attendance.checkIn || '—'}</p></div><div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-bold uppercase text-blue-700">{t('Check-out')}</p><p className="mt-2 text-2xl font-extrabold text-blue-800">{attendance.checkOut || '—'}</p></div></div><div className="mt-6 flex flex-wrap gap-3"><Button disabled={Boolean(attendance.checkIn)} onClick={checkIn}><LogIn size={17}/>{t('Check in')}</Button><Button variant="secondary" disabled={!attendance.checkIn || Boolean(attendance.checkOut)} onClick={checkOut}><LogOut size={17}/>{t('Check out')}</Button></div></Card><Card className="p-5"><CalendarDays size={24} className="text-orange-500"/><h2 className="mt-3 font-bold text-slate-900">{t('Attendance policy')}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('Check in when you begin work and check out when your workday ends. Contact HR to correct an attendance record.')}</p></Card></div></AppShell>;

  if (mode === 'surveys') return <AppShell breadcrumb={['Self Service', 'My Surveys']}><SectionHeader title="My Surveys" description="Share confidential feedback through active employee surveys."/><Card className="mx-auto max-w-3xl p-6">{surveyDone ? <div className="py-10 text-center"><CheckCircle2 size={48} className="mx-auto text-emerald-500"/><h2 className="mt-4 text-xl font-bold text-slate-900">{t('Response submitted')}</h2><p className="mt-2 text-sm text-slate-500">{t('Thank you. Your response has been recorded anonymously.')}</p></div> : <><div className="flex items-center gap-3"><HeartPulse size={25} className="text-orange-500"/><div><h2 className="font-bold text-slate-900">Q4 Employee Pulse Survey</h2><p className="text-sm text-slate-500">{t('Due October 20, 2026')}</p></div></div><div className="mt-6 space-y-5"><SurveyQuestion label="How satisfied are you with your current role?" value={answers.satisfaction} onChange={value => setAnswers({...answers,satisfaction:value})}/><SurveyQuestion label="How manageable is your current workload?" value={answers.workload} onChange={value => setAnswers({...answers,workload:value})}/><label className="block text-sm font-semibold text-slate-700">{t('Additional comments')}<textarea value={answers.comment} onChange={event => setAnswers({...answers,comment:event.target.value})} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/></label></div><Button className="mt-6" disabled={!answers.satisfaction || !answers.workload} onClick={() => { sessionStorage.setItem('eris-survey-q4-2026', 'submitted'); setSurveyDone(true); }}><Send size={16}/>{t('Submit response')}</Button></>}</Card></AppShell>;

  const actions = [{ label:'My Profile',description:'Review personal and employment information',icon:IdCard,to:'/my-profile'},{label:'My Attendance',description:attendance.checkIn&&!attendance.checkOut?'You are currently checked in':attendance.checkOut?'Today’s workday is complete':'Record today’s working time',icon:Clock3,to:'/my-attendance'},{label:'My Surveys',description:surveyDone?'Active survey completed':'1 active survey awaiting your response',icon:HeartPulse,to:'/my-surveys'}];
  return <AppShell breadcrumb={['Employee Self Service']}><section className="mb-5 rounded-[24px] bg-gradient-to-r from-slate-900 to-slate-700 p-7 text-white shadow-xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">{t('Employee Self Service')}</p><h1 className="mt-2 text-2xl font-extrabold">{t('Welcome back')}, {employee.name}</h1><p className="mt-2 text-sm text-slate-300">{t('Review your information, record attendance, and complete active surveys.')}</p></section><div className="grid gap-5 md:grid-cols-3">{actions.map(action => <button key={action.to} onClick={() => navigate(action.to)} className="rounded-[20px] bg-white p-6 text-left shadow-[0_8px_28px_rgba(30,41,59,0.07)] transition hover:-translate-y-0.5 hover:shadow-lg"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><action.icon size={22}/></span><h2 className="mt-5 font-bold text-slate-900">{t(action.label)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t(action.description)}</p></button>)}</div></AppShell>;
}

function SurveyQuestion({ label, value, onChange }: { label: string; value: string; onChange: (value:string)=>void }) {
  const { t } = useLanguage();
  return <fieldset><legend className="text-sm font-semibold text-slate-700">{t(label)}</legend><div className="mt-2 flex flex-wrap gap-2">{['1','2','3','4','5'].map(score => <button type="button" key={score} onClick={() => onChange(score)} className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold ${value===score?'border-orange-500 bg-orange-500 text-white':'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}>{score}</button>)}</div></fieldset>;
}
