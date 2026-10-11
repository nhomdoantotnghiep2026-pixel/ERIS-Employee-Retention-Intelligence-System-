import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, HelpCircle, ChevronDown, ChevronRight, PanelLeft, ArrowUpRight, LogOut, CheckCheck, Building2, CalendarDays, DatabaseZap } from 'lucide-react';
import { useRole, type UserRole } from '../context/RoleContext';
import { employees } from '../data/mockData';

type Link = { label: string; to: string };
type Props = { breadcrumb?: string[]; sidebarOpen: boolean; toggleSidebar: () => void; links: Record<UserRole, { items: Link[] }[]> };
const notices: Record<UserRole, { title: string; detail: string; to: string }[]> = {
  'HR Manager': [
    { title: 'Retention plan needs review', detail: 'Review current interventions and next steps.', to: '/interventions' },
    { title: 'Engagement overview available', detail: 'Explore the latest survey results.', to: '/engagement' },
  ],
  'HR Staff': [
    { title: 'Review your retention tasks', detail: 'Check assignments and upcoming due dates.', to: '/retention-tasks' },
    { title: 'Pulse surveys to follow up', detail: 'Review participation and survey progress.', to: '/pulse-surveys' },
  ],
  'Data / AI Analyst': [
    { title: 'Review data preparation', detail: 'Check data quality before the next model run.', to: '/preparation' },
    { title: 'Model monitoring summary', detail: 'Review model versions and drift indicators.', to: '/model-history' },
  ],
  'System Administrator': [
    { title: 'Access review', detail: 'Review user access and role assignments.', to: '/users' },
    { title: 'System health overview', detail: 'Inspect service status and recent incidents.', to: '/system-health' },
  ],
};
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function EnterpriseHeader({ breadcrumb, sidebarOpen, toggleSidebar, links }: Props) {
  const { user } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [panel, setPanel] = useState<'search' | 'notifications' | 'help' | 'account' | null>(null);
  const [query, setQuery] = useState('');
  const [read, setRead] = useState<string[]>(() => { try { return JSON.parse(sessionStorage.getItem('eris-notifications-read') || '[]'); } catch { return []; } });
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const pages = links[user.role].flatMap(group => group.items);
  const results = [
    ...pages.map(p => ({ ...p, category: 'Page' })),
    ...(['HR Manager', 'HR Staff'].includes(user.role) && query.trim() ? employees.map(e => ({ label: e.name, to: `/employees/${e.id}`, category: `${e.employeeId} · ${e.department}` })) : []),
  ].filter(r => normalize(`${r.label} ${r.category}`).includes(normalize(query.trim()))).slice(0, 8);
  const notificationItems = notices[user.role];
  const key = (i: number) => `${user.role}:${i}`;
  const unread = notificationItems.filter((_, i) => !read.includes(key(i))).length;
  const markRead = (ids: string[]) => setRead(old => { const next = [...new Set([...old, ...ids])]; sessionStorage.setItem('eris-notifications-read', JSON.stringify(next)); return next; });
  const go = (to: string) => { setPanel(null); setQuery(''); navigate(to); };
  useEffect(() => { setPanel(null); setQuery(''); }, [pathname, user.role]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setPanel(null); };
    const keyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPanel('search'); input.current?.focus(); }
      if (e.key === 'Escape') { setPanel(null); if (document.activeElement === input.current) input.current?.blur(); else trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); };
  }, []);
  const toggle = (name: 'notifications' | 'help' | 'account', button: HTMLButtonElement) => { trigger.current = button; setPanel(panel === name ? null : name); };
  const iconButton = 'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:h-9 sm:w-9';
  const popover = 'absolute top-[calc(100%+12px)] right-0 w-[340px] max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden';
  return (
    <header ref={root} className="sticky top-0 z-30 flex min-h-[76px] shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-gradient-to-r from-white via-white to-indigo-50/40 px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-5">
      <button className={iconButton} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={sidebarOpen} onClick={toggleSidebar} title="Toggle sidebar"><PanelLeft size={18} /></button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"><Building2 size={11} /> ERIS workspace <span className="ml-1 rounded border border-amber-200 bg-amber-50 px-1.5 text-[9px] tracking-normal text-amber-700">DEMO</span></div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
          {(breadcrumb?.length ? breadcrumb : ['Workspace']).map((crumb, i, crumbs) => {
            const target = pages.find(p => p.label === crumb || (crumb === 'Employees' && p.to === '/employees'));
            return <span key={i} className="flex min-w-0 items-center gap-1.5">{i > 0 && <ChevronRight size={12} className="shrink-0 text-slate-300" />}{i < crumbs.length - 1 && target ? <button onClick={() => go(target.to)} className="text-slate-500 hover:text-indigo-600">{crumb}</button> : <span aria-current={i === crumbs.length - 1 ? 'page' : undefined} className="truncate font-medium text-slate-800">{crumb}</span>}</span>;
          })}
        </nav>
      </div>
      <div className="hidden items-center gap-2 xl:flex">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 text-[11px] text-slate-600 shadow-sm shadow-slate-900/[0.02]">
          <CalendarDays size={14} className="text-indigo-500" />
          <span className="font-medium">Sep 24, 2026</span>
        </div>
        <div className="flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 text-[11px] text-emerald-800">
          <DatabaseZap size={14} className="text-emerald-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
          <span className="font-medium">Data synced</span>
          <span className="text-emerald-600">8m ago</span>
        </div>
      </div>
      <div className="relative order-last w-full md:order-none md:w-[280px] xl:w-[360px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
        <input ref={input} aria-label="Search workspace" aria-expanded={panel === 'search'} aria-controls="workspace-results" value={query} onChange={e => { setQuery(e.target.value); setPanel('search'); }} onFocus={() => setPanel('search')} onKeyDown={e => { if (e.key === 'Enter' && results[0]) go(results[0].to); }} placeholder="Search people, pages, reports..." className="h-11 w-full rounded-lg border border-slate-200 bg-white/90 pl-9 pr-16 text-base shadow-sm shadow-slate-900/[0.02] outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:h-10 sm:text-[13px]" />
        <kbd className="pointer-events-none absolute right-3 top-2.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">Ctrl K</kbd>
        {panel === 'search' && <div id="workspace-results" className={popover + ' w-full'}><div className="border-b border-slate-100 px-4 py-3 text-[11px] font-medium text-slate-500">{query ? 'Search results' : 'Quick navigation'} · {user.role}</div>{results.length ? results.map(r => <button key={r.to} onClick={() => go(r.to)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"><span><span className="block text-[13px] font-medium text-slate-700">{r.label}</span><span className="text-[11px] text-slate-400">{r.category}</span></span><ArrowUpRight size={14} className="text-slate-400" /></button>) : <p className="p-5 text-sm text-slate-500">No results. Try a page name or employee name.</p>}</div>}
      </div>
      <div className="flex items-center gap-1">
        <div className="relative">
          <button aria-label={`Notifications, ${unread} unread`} aria-expanded={panel === 'notifications'} onClick={e => toggle('notifications', e.currentTarget)} className={iconButton} title="Notifications"><Bell size={18} />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-semibold text-white ring-2 ring-white">{unread}</span>}</button>
          {panel === 'notifications' && <section aria-label="Notifications" className={popover}><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="text-sm font-semibold text-slate-900">Notifications</h2><p className="mt-0.5 text-[11px] text-slate-400">Demo inbox · {user.role}</p></div><button aria-label="Mark all as read" title="Mark all as read" onClick={() => markRead(notificationItems.map((_, i) => key(i)))} className={iconButton}><CheckCheck size={17} /></button></div>{notificationItems.map((n, i) => <button key={n.to} onClick={() => { markRead([key(i)]); go(n.to); }} className="flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read.includes(key(i)) ? 'bg-slate-200' : 'bg-indigo-500'}`} /><span><span className="block text-[13px] font-medium text-slate-800">{n.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{n.detail}</span></span></button>)}</section>}
        </div>
        <div className="relative"><button aria-label="Help center" aria-expanded={panel === 'help'} onClick={e => toggle('help', e.currentTarget)} className={iconButton} title="Help center"><HelpCircle size={18} /></button>{panel === 'help' && <section aria-label="Help center" className={popover + ' p-5'}><h2 className="text-sm font-semibold text-slate-900">Workspace guide</h2><p className="mt-3 text-xs leading-6 text-slate-600">Use the sidebar to explore your role’s tools. Press Ctrl + K to find pages{['HR Manager', 'HR Staff'].includes(user.role) ? ' and employees' : ''}. Open notifications to review relevant work.</p><div className="mt-4 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">AI risk scores support human review. They are not employment decisions. This workspace currently uses demonstration data.</div><button onClick={() => { setPanel('search'); input.current?.focus(); }} className="mt-4 text-xs font-semibold text-indigo-600">Explore available pages →</button></section>}</div>
      </div>
      <div className="relative border-l border-slate-200 pl-3">
        <button aria-label="Account menu" aria-expanded={panel === 'account'} onClick={e => toggle('account', e.currentTarget)} className="flex items-center gap-2.5 rounded-lg p-1 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 ring-2 ring-white">{user.initials}</span><span className="hidden lg:block"><span className="block text-xs font-semibold text-slate-800">{user.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{user.role}</span></span><ChevronDown size={13} className="text-slate-400" /></button>
        {panel === 'account' && <section aria-label="Account details" className={popover + ' w-[300px]'}><div className="border-b border-slate-100 p-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">{user.initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="mt-1 truncate text-xs text-slate-500">{user.email}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">{user.role}</span>{user.role === 'HR Manager' && <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">Giám đốc nhân sự</span>}</div></div></div></div><button onClick={() => go('/login')} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"><LogOut size={15} /> Sign out</button></section>}
      </div>
    </header>
  );
}
