import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronDown, HelpCircle, LogOut, PanelLeft } from 'lucide-react';
import { useRole, type UserRole } from '../context/RoleContext';
import { useLanguage } from '../context/LanguageContext';

type Link = { label: string; to: string };
type Props = { breadcrumb?: string[]; sidebarOpen: boolean; toggleSidebar: () => void; links: Record<UserRole, { items: Link[] }[]> };

const notices: Record<UserRole, { title: string; detail: string; to: string }[]> = {
  'HR': [{ title: 'Retention plan needs review', detail: 'Review current interventions and next steps.', to: '/interventions' }, { title: 'Engagement overview available', detail: 'Explore the latest survey results.', to: '/engagement' }],
  'Data / AI Analyst': [{ title: 'Review data preparation', detail: 'Check data quality before the next model run.', to: '/preparation' }, { title: 'Model monitoring summary', detail: 'Review model versions and drift indicators.', to: '/model-history' }],
  'System Administrator': [{ title: 'Access review', detail: 'Review user access and role assignments.', to: '/users' }, { title: 'System health overview', detail: 'Inspect service status and recent incidents.', to: '/system-health' }],
  'Employee / ESS': [{ title: 'Pulse survey available', detail: 'Complete your active employee survey.', to: '/my-surveys' }, { title: 'Attendance reminder', detail: 'Remember to record today’s attendance.', to: '/my-attendance' }],
};

export function EnterpriseHeader({ breadcrumb, sidebarOpen, toggleSidebar, links }: Props) {
  const { user, signOut } = useRole();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [panel, setPanel] = useState<'notifications' | 'help' | 'account' | null>(null);
  const [read, setRead] = useState<string[]>(() => { try { return JSON.parse(sessionStorage.getItem('eris-notifications-read') || '[]'); } catch { return []; } });
  const root = useRef<HTMLElement>(null);
  const pages = links[user.role].flatMap(group => group.items);
  const notificationItems = notices[user.role];
  const key = (i: number) => `${user.role}:${i}`;
  const unread = notificationItems.filter((_, i) => !read.includes(key(i))).length;
  const title = t((breadcrumb?.length ? breadcrumb[breadcrumb.length - 1] : pages.find(page => pathname.startsWith(page.to))?.label) || 'Workspace');
  const markRead = (ids: string[]) => setRead(old => { const next = [...new Set([...old, ...ids])]; sessionStorage.setItem('eris-notifications-read', JSON.stringify(next)); return next; });
  const go = (to: string) => { setPanel(null); navigate(to); };
  const handleSignOut = () => {
    signOut();
    setPanel(null);
    navigate('/login', { replace: true });
  };

  useEffect(() => { setPanel(null); }, [pathname, user.role]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setPanel(null); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') setPanel(null); };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); };
  }, []);

  const iconButton = 'relative flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const popover = 'absolute right-0 top-[calc(100%+12px)] w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-900/15';
  const accountPopover = 'absolute right-0 top-[calc(100%+8px)] w-[148px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl shadow-slate-900/10';

  return (
    <header ref={root} className="sticky top-0 z-30 flex min-h-[58px] shrink-0 items-center gap-2 bg-gradient-to-r from-[#f59b32] via-[#f47b2c] to-[#ef5b2a] px-3 py-1.5 text-white shadow-[0_4px_16px_rgba(234,88,12,0.16)] sm:px-6">
      <button className={iconButton + ' lg:hidden'} aria-label={sidebarOpen ? t('Collapse sidebar') : t('Expand sidebar')} aria-expanded={sidebarOpen} onClick={toggleSidebar}><PanelLeft size={21} /></button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-[-0.01em] sm:text-xl">{title}</h1>
      <button type="button" onClick={toggleLanguage} className="flex h-10 min-w-10 items-center justify-center rounded-full bg-white/15 px-3 text-xs font-bold hover:bg-white/25" aria-label={language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}>{language === 'en' ? 'VI' : 'EN'}</button>
      <div className="relative">
        <button className={iconButton} aria-label={`${t('Notifications')}, ${unread} unread`} onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}><Bell size={20} />{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-orange-600">{unread}</span>}</button>
        {panel === 'notifications' && <section className={popover}><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="font-bold">{t('Notifications')}</h2><p className="text-xs text-slate-500">{t('Your latest updates')}</p></div><button onClick={() => markRead(notificationItems.map((_, i) => key(i)))} className="flex h-9 w-9 items-center justify-center rounded-full text-orange-600 hover:bg-orange-50" aria-label={t('Mark all as read')}><CheckCheck size={18} /></button></div>{notificationItems.map((notice, i) => <button key={notice.to} onClick={() => { markRead([key(i)]); go(notice.to); }} className="flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-orange-50"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${read.includes(key(i)) ? 'bg-slate-200' : 'bg-orange-500'}`} /><span><b className="block text-sm">{t(notice.title)}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{t(notice.detail)}</span></span></button>)}</section>}
      </div>
      <div className="relative hidden sm:block"><button className={iconButton} aria-label={t('Help center')} onClick={() => setPanel(panel === 'help' ? null : 'help')}><HelpCircle size={20} /></button>{panel === 'help' && <section className={popover + ' p-5'}><h2 className="font-bold">{t('Workspace guide')}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('Use the sidebar to explore tools for your role and search for the page you need.')}</p></section>}</div>
      <div className="relative">
        <button onClick={() => setPanel(panel === 'account' ? null : 'account')} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-2 py-1 text-left text-slate-800 shadow-sm hover:bg-orange-50 sm:pr-4" aria-label={t('Account menu')}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">{user.initials}</span><span className="hidden lg:block"><b className="block max-w-32 truncate text-xs">{user.name}</b><span className="block text-[10px] text-slate-500">{t(user.role)}</span></span><ChevronDown size={14} className="hidden text-slate-400 sm:block" /></button>
        {panel === 'account' && <section className={accountPopover}><button onClick={handleSignOut} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"><LogOut size={16} />{t('Sign out')}</button></section>}
      </div>
    </header>
  );
}
