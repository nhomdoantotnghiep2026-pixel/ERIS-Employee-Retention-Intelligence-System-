import { EnterpriseHeader } from './EnterpriseHeader';
import { type ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Database,
  Settings, ChevronDown, Bell, Search, HelpCircle, LogOut,
  User, Shield, Activity, GitBranch, AlertTriangle,
  BarChart2, ServerCog, Network, UserPlus, Target, MessageSquare,
  FileBarChart2, Workflow, Sliders, Table2, BrainCircuit,
  TrendingUp, History, ScrollText, Zap, ClipboardList,
  HeartPulse, Download, MonitorCheck, KeyRound, X, Leaf, ChevronLeft, Upload, RefreshCw,
  CalendarClock, WalletCards, ClipboardCheck, DoorOpen
} from 'lucide-react';
import { useRole, type UserRole } from '../context/RoleContext';
import { useLanguage } from '../context/LanguageContext';
import { hasRoutePermission, RBAC_UPDATED_EVENT } from '../utils/rbacAccess';

type NavItem = { label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; to: string };
type NavGroup = { group?: string; items: NavItem[] };

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  'HR': [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'Organization Overview', icon: BarChart3, to: '/org-overview' },
      ],
    },
    {
      group: 'Workforce',
      items: [
        { label: 'Employee Directory', icon: Users, to: '/employees' },
        { label: 'Add Employee', icon: UserPlus, to: '/employees/new' },
        { label: 'Import Employees', icon: Upload, to: '/employees/import' },
        { label: 'Bulk Update', icon: RefreshCw, to: '/employees/bulk-update' },
        { label: 'Employee Requests', icon: ClipboardList, to: '/employee-requests' },
        { label: 'Org Chart', icon: Network, to: '/org-chart' },
        { label: 'Onboarding & Offboarding', icon: UserPlus, to: '/onboarding' },
      ],
    },
    {
      group: 'Retention',
      items: [
        { label: 'Attrition Risk Analytics', icon: AlertTriangle, to: '/attrition-risk' },
        { label: 'Retention Interventions', icon: Target, to: '/interventions' },
      ],
    },
    {
      group: 'Engagement',
      items: [
        { label: 'Engagement Surveys', icon: MessageSquare, to: '/engagement' },
      ],
    },
    {
      group: 'Reports',
      items: [
        { label: 'Executive Reports', icon: FileBarChart2, to: '/executive-reports' },
      ],
    },
  ],
  'Employee / ESS': [
    {
      group: 'My Workspace',
      items: [
        { label: 'Employee Dashboard', icon: LayoutDashboard, to: '/employee-dashboard' },
        { label: 'My Profile', icon: User, to: '/my-profile' },
      ],
    },
    {
      group: 'Self Service',
      items: [
        { label: 'My Attendance', icon: Activity, to: '/my-attendance' },
        { label: 'Requests & Approvals', icon: CalendarClock, to: '/my-requests' },
        { label: 'My Payslips', icon: WalletCards, to: '/my-payroll' },
        { label: 'Goals & Review', icon: ClipboardCheck, to: '/my-performance' },
        { label: 'Offboarding', icon: DoorOpen, to: '/my-offboarding' },
        { label: 'My Surveys', icon: HeartPulse, to: '/my-surveys' },
      ],
    },
  ],
  'Data / AI Analyst': [
    {
      group: 'Overview',
      items: [
        { label: 'Data Overview', icon: LayoutDashboard, to: '/data-overview' },
      ],
    },
    {
      group: 'Data Management',
      items: [
        { label: 'Datasets & Import', icon: Database, to: '/data' },
        { label: 'Data Preparation', icon: Workflow, to: '/preparation' },
        { label: 'Schema & Mapping', icon: Table2, to: '/schema' },
      ],
    },
    {
      group: 'AI Models',
      items: [
        { label: 'Model Configuration', icon: Sliders, to: '/ai-config' },
        { label: 'Model Performance', icon: TrendingUp, to: '/model-performance' },
        { label: 'Feature Importance (SHAP)', icon: BrainCircuit, to: '/feature-importance' },
        { label: 'Model History & Drift', icon: History, to: '/model-history' },
      ],
    },
    {
      group: 'System & Logs',
      items: [
        { label: 'Data Pipelines', icon: Workflow, to: '/data-pipelines' },
        { label: 'Processing Audit Logs', icon: ScrollText, to: '/audit-logs' },
      ],
    },
  ],
  'System Administrator': [
    {
      group: 'Overview',
      items: [
        { label: 'Admin Overview', icon: ServerCog, to: '/admin-overview' },
      ],
    },
    {
      group: 'Access Control',
      items: [
        { label: 'Users Management', icon: User, to: '/users' },
        { label: 'Roles & Permissions', icon: KeyRound, to: '/roles' },
      ],
    },
    {
      group: 'System Operations',
      items: [
        { label: 'System Configuration', icon: Settings, to: '/system' },
        { label: 'Audit & Activity Logs', icon: ScrollText, to: '/activity' },
        { label: 'System Health Monitor', icon: MonitorCheck, to: '/system-health' },
      ],
    },
  ],
};

function SidebarLink({ to, icon: Icon, label, onNavigate, collapsed = false, nested = false }: NavItem & { onNavigate?: () => void; collapsed?: boolean; nested?: boolean }) {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const employeeOperation = ['/employees/new', '/employees/import', '/employees/bulk-update'].some(route => pathname.startsWith(route));
  const isActive = pathname === to || (to === '/employees' ? pathname.startsWith('/employees/') && !employeeOperation : pathname.startsWith(to + '/'));
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? t(label) : undefined}
      aria-label={collapsed ? t(label) : undefined}
      className={`flex items-center transition-all duration-300 ${nested && !collapsed ? 'ml-5 min-h-10 gap-3 text-[15px]' : `min-h-12 text-[16px] ${collapsed ? 'mx-auto h-12 w-12 justify-center gap-0 rounded-2xl' : 'gap-4'}`} ${
        isActive
          ? `${collapsed ? 'bg-[#f47721] px-0 text-white shadow-[0_7px_18px_rgba(244,119,33,0.24)]' : nested ? 'rounded-full bg-orange-50 px-4 text-orange-700' : '-ml-3 rounded-r-full bg-[#f47721] pl-8 pr-4 text-white shadow-[0_7px_18px_rgba(244,119,33,0.22)]'} font-bold`
          : `${collapsed ? 'px-0 text-[#71809d] hover:bg-orange-50 hover:text-orange-700' : nested ? 'rounded-full px-4' : 'rounded-r-full px-5'} font-normal text-[#64748b] hover:bg-orange-50 hover:text-orange-700`
      }`}
    >
      <Icon size={nested && !collapsed ? 17 : 23} strokeWidth={1.8} className={`flex-shrink-0 ${isActive ? nested && !collapsed ? 'text-orange-600' : 'text-white' : 'text-[#71809d]'}`} />
      <span className={`truncate transition-all duration-200 ${collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>{t(label)}</span>
    </NavLink>
  );
}
function Sidebar({ onNavigate, collapsed, onToggle }: { onNavigate?: () => void; collapsed: boolean; onToggle: () => void }) {
  const { user } = useRole();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [navQuery, setNavQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [, setPermissionRevision] = useState(0);
  const navGroups = NAV_BY_ROLE[user.role].map(group => ({
    ...group,
    items: group.items.filter(item => hasRoutePermission(user.role, item.to)),
  })).filter(group => group.items.length);
  const visibleGroups = navGroups.map(group => ({ ...group, items: group.items.filter(item => t(item.label).toLowerCase().includes(navQuery.trim().toLowerCase())) })).filter(group => group.items.length);
  const visibleItems = visibleGroups.flatMap(group => group.items);
  const activeGroup = navGroups.find(group => group.items.some(item => pathname === item.to || pathname.startsWith(item.to + '/')))?.group;

  useEffect(() => {
    if (activeGroup) setOpenGroups(groups => groups.includes(activeGroup) ? groups : [...groups, activeGroup]);
  }, [activeGroup]);

  useEffect(() => {
    const refresh = () => setPermissionRevision(value => value + 1);
    window.addEventListener(RBAC_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(RBAC_UPDATED_EVENT, refresh);
  }, []);

  return (
    <aside aria-label="Main navigation" className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-w-[88vw] flex-shrink-0 flex-col overflow-visible rounded-br-[40px] bg-white shadow-2xl transition-[width,transform] duration-300 ease-out lg:sticky lg:top-0 lg:z-40 lg:translate-x-0 lg:shadow-[5px_0_26px_rgba(30,41,59,0.10)] ${collapsed ? '-translate-x-full w-[292px] lg:w-[96px]' : 'w-[320px] translate-x-0 lg:w-[292px]'}`}>
      <button type="button" onClick={onToggle} aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')} className={`absolute top-[76px] z-50 hidden h-9 w-9 items-center justify-center rounded-full bg-[#f47721] text-white shadow-lg shadow-orange-700/25 transition-[right,transform] duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 lg:flex ${collapsed ? 'right-3' : '-right-4'}`}>
        <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-br-[40px] bg-white">
      {/* Logo */}
      <div className={`flex items-center justify-between py-4 transition-[min-height,padding] duration-300 ${collapsed ? 'min-h-[96px] px-6' : 'min-h-[112px] px-7'}`}>
        <div className={`flex items-center ${collapsed ? 'gap-0' : 'gap-2.5'}`}>
          <div className={`relative flex flex-shrink-0 items-center justify-center rounded-full border-[3px] border-orange-500 text-orange-500 transition-all duration-300 ${collapsed ? 'h-11 w-11' : 'h-12 w-12'}`}>
            <Leaf size={20} className={`absolute -right-1 -top-3 rotate-[25deg] text-emerald-500 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`} fill="currentColor" />
            <span className="text-xl font-black">e</span>
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'w-0 opacity-0' : 'w-[150px] opacity-100'}`}>
            <div className="text-2xl font-extrabold leading-none tracking-tight text-slate-700">ERIS</div>
            <div className="mt-1 text-[10px] font-medium leading-none text-emerald-600">{t('Retention Intelligence')}</div>
          </div>
        </div>
        <button type="button" onClick={onNavigate} aria-label={t('Close navigation')} className="flex h-11 w-11 items-center justify-center rounded-full text-[#71809d] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 lg:hidden">
          <X size={20} />
        </button>
      </div>

      <div className={`border-b border-slate-100 transition-[padding] duration-300 ${collapsed ? 'px-6 pb-3' : 'px-7 pb-5'}`}>
        <div className={`relative ${collapsed ? 'flex h-12 w-12 items-center justify-center rounded-2xl hover:bg-orange-50' : ''}`}>
          <Search size={24} strokeWidth={1.8} className={`pointer-events-none text-[#71809d] ${collapsed ? '' : 'absolute left-1 top-1/2 -translate-y-1/2'}`} />
          <input value={navQuery} onChange={event => setNavQuery(event.target.value)} aria-label={t('Search menu')} placeholder={t('Search')} className={`h-12 border-0 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-500 focus:ring-0 ${collapsed ? 'pointer-events-none w-0 p-0 opacity-0' : 'w-full pl-11 pr-3 opacity-100'}`} />
        </div>
      </div>

      {/* Role-specific nav */}
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'space-y-2 px-0' : 'space-y-1 px-3'}`}>
        {collapsed ? visibleGroups.map((group, index) => {
          const groupKey = group.group || `group-${index}`;
          if (!group.group || group.items.length === 1) return group.items.map(item => <SidebarLink key={item.to} {...item} collapsed onNavigate={onNavigate} />);
          const GroupIcon = group.items[0].icon;
          const groupActive = activeGroup === group.group;
          return <button key={groupKey} type="button" title={t(group.group)} aria-label={t(group.group)} onClick={() => { setOpenGroups(groups => groups.includes(groupKey) ? groups : [...groups, groupKey]); onToggle(); }} className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${groupActive ? 'bg-[#f47721] text-white shadow-[0_7px_18px_rgba(244,119,33,0.24)]' : 'text-[#71809d] hover:bg-orange-50 hover:text-orange-700'}`}><GroupIcon size={23} strokeWidth={1.8} /></button>;
        }) : visibleGroups.map((group, index) => {
          const groupKey = group.group || `group-${index}`;
          const expanded = Boolean(navQuery) || openGroups.includes(groupKey);
          if (!group.group || group.items.length === 1) return group.items.map(item => <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />);
          const GroupIcon = group.items[0].icon;
          const groupActive = activeGroup === group.group;
          return <div key={groupKey} className="py-0.5">
            <button type="button" onClick={() => setOpenGroups(groups => groups.includes(groupKey) ? groups.filter(key => key !== groupKey) : [...groups, groupKey])} aria-expanded={expanded} className={`flex min-h-12 w-full items-center gap-4 rounded-r-full px-5 text-left text-[15px] transition-colors ${groupActive ? 'font-bold text-orange-700' : 'text-[#64748b] hover:bg-orange-50 hover:text-orange-700'}`}>
              <GroupIcon size={23} strokeWidth={1.8} className={groupActive ? 'text-orange-600' : 'text-[#71809d]'} />
              <span className="min-w-0 flex-1 truncate">{t(group.group)}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <div aria-hidden={!expanded} inert={!expanded} className={`grid transition-[grid-template-rows,opacity] duration-200 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 overflow-hidden space-y-0.5 pb-1">{group.items.map(item => <SidebarLink key={item.to} {...item} nested onNavigate={onNavigate} />)}</div></div>
          </div>;
        })}
        {!visibleItems.length && <p className="px-5 py-8 text-center text-sm text-slate-400">{t('No menu items found')}</p>}
      </nav>

      <div className={`overflow-hidden border-t border-slate-100 text-xs text-slate-400 transition-all duration-300 ${collapsed ? 'h-0 border-transparent p-0 opacity-0' : 'px-7 py-4 opacity-100'}`}>{t(user.role)} · {t('Demo environment')}</div>
      </div>
    </aside>
  );
}

export function AppShell({ children, breadcrumb }: { children: ReactNode; breadcrumb?: string[] }) {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024 && sessionStorage.getItem('eris-sidebar') !== 'closed');
  const toggleSidebar = () => setSidebarOpen(open => { sessionStorage.setItem('eris-sidebar', open ? 'closed' : 'open'); return !open; });
  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && window.innerWidth < 1024) setSidebarOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F3F9]">
      <a href="#main-content" className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white shadow-lg transition focus:translate-y-0">{t('Skip to main content')}</a>
      {sidebarOpen && <button type="button" aria-label={t('Close navigation')} onClick={closeMobileSidebar} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden" />}
      <Sidebar onNavigate={closeMobileSidebar} collapsed={!sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <EnterpriseHeader breadcrumb={breadcrumb} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} links={NAV_BY_ROLE} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.07),transparent_28rem)] outline-none">
          <div className="eris-content mx-auto w-full max-w-[1480px] p-4 sm:p-5 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
