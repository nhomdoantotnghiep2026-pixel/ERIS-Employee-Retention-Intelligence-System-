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
  HeartPulse, Download, MonitorCheck, KeyRound, X
} from 'lucide-react';
import { useRole, type UserRole } from '../context/RoleContext';

type NavItem = { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; to: string };
type NavGroup = { group?: string; items: NavItem[] };

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  'HR Staff': [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Staff Dashboard', icon: LayoutDashboard, to: '/staff-dashboard' },
      ],
    },
    {
      group: 'WORKFORCE MANAGEMENT',
      items: [
        { label: 'Employee Directory', icon: Users, to: '/employees' },
        { label: 'Attrition Risk Monitor', icon: AlertTriangle, to: '/staff-risk-monitor' },
        { label: 'Retention Tasks', icon: ClipboardList, to: '/retention-tasks' },
      ],
    },
    {
      group: 'ENGAGEMENT',
      items: [
        { label: 'Pulse Surveys', icon: HeartPulse, to: '/pulse-surveys' },
      ],
    },
    {
      group: 'REPORTS',
      items: [
        { label: 'Export Reports', icon: Download, to: '/export-reports' },
      ],
    },
  ],
  'HR Manager': [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'Organization Overview', icon: BarChart3, to: '/org-overview' },
      ],
    },
    {
      group: 'WORKFORCE',
      items: [
        { label: 'Employee Directory', icon: Users, to: '/employees' },
        { label: 'Org Chart', icon: Network, to: '/org-chart' },
        { label: 'Onboarding & Offboarding', icon: UserPlus, to: '/onboarding' },
      ],
    },
    {
      group: 'PERFORMANCE & RETENTION',
      items: [
        { label: 'Attrition Risk Analytics', icon: AlertTriangle, to: '/attrition-risk' },
        { label: 'Retention Interventions', icon: Target, to: '/interventions' },
        { label: 'Engagement Surveys', icon: MessageSquare, to: '/engagement' },
      ],
    },
    {
      group: 'REPORTS',
      items: [
        { label: 'Executive Reports', icon: FileBarChart2, to: '/executive-reports' },
      ],
    },
  ],
  'Data / AI Analyst': [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Data Overview', icon: LayoutDashboard, to: '/data-overview' },
      ],
    },
    {
      group: 'DATA MANAGEMENT',
      items: [
        { label: 'Datasets & Import', icon: Database, to: '/data' },
        { label: 'Data Preparation', icon: Workflow, to: '/preparation' },
        { label: 'Schema & Mapping', icon: Table2, to: '/schema' },
      ],
    },
    {
      group: 'AI MODEL OPERATIONS',
      items: [
        { label: 'Model Performance', icon: TrendingUp, to: '/model-performance' },
        { label: 'Feature Importance (SHAP)', icon: BrainCircuit, to: '/feature-importance' },
        { label: 'Model History & Drift', icon: History, to: '/model-history' },
      ],
    },
    {
      group: 'SYSTEM & LOGS',
      items: [
        { label: 'Processing Audit Logs', icon: ScrollText, to: '/audit-logs' },
      ],
    },
  ],
  'System Administrator': [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Admin Overview', icon: ServerCog, to: '/admin-overview' },
      ],
    },
    {
      group: 'IDENTITY & ACCESS',
      items: [
        { label: 'Users Management', icon: User, to: '/users' },
        { label: 'Roles & Permissions', icon: KeyRound, to: '/roles' },
      ],
    },
    {
      group: 'SYSTEM OPERATIONS',
      items: [
        { label: 'System Configuration', icon: Settings, to: '/system' },
        { label: 'Audit & Activity Logs', icon: ScrollText, to: '/activity' },
        { label: 'System Health Monitor', icon: MonitorCheck, to: '/system-health' },
      ],
    },
  ],
};

function SidebarLink({ to, icon: Icon, label, onNavigate }: NavItem & { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 px-2.5 h-[34px] text-[13px] transition-colors rounded-[5px] ${
        isActive
          ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
          : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={15} className={`flex-shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useRole();


  const navGroups = NAV_BY_ROLE[user.role];

  return (
    <aside aria-label="Main navigation" className="fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] max-w-[85vw] flex-shrink-0 flex-col border-r border-slate-200 bg-white shadow-2xl lg:sticky lg:top-0 lg:z-auto lg:w-[240px] lg:shadow-none">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#4F46E5] flex items-center justify-center flex-shrink-0 rounded-[5px]">
            <BarChart3 size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-900 leading-none">ERIS</div>
            <div className="text-[10px] text-gray-400 leading-none mt-0.5">Employee Retention Intelligence</div>
          </div>
        </div>
        <button type="button" onClick={onNavigate} aria-label="Close navigation" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 lg:hidden">
          <X size={20} />
        </button>
      </div>

      {/* Role-specific nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navGroups.map((grp, i) => (
          <div key={i}>
            {grp.group && (
              <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
                {grp.group}
              </div>
            )}
            <div className="space-y-0.5">
              {grp.items.map(item => (
                <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* HR Staff — active interventions widget */}
      {user.role === 'HR Staff' && (
        <div className="px-3 py-2.5 border-t border-slate-100">
          <div className="bg-amber-50 border border-amber-200 rounded-[5px] px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardList size={11} className="text-amber-500 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-[0.08em]">My Tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-amber-800 font-semibold">3 Active Interventions Pending</span>
            </div>
          </div>
        </div>
      )}

      {/* HR Manager — decision queue widget */}
      {user.role === 'HR Manager' && (
        <div className="px-3 py-2.5 border-t border-slate-100">
          <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Target size={12} className="text-indigo-600 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-[0.08em]">Today’s Focus</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-800">4 employees need review</div>
            <div className="mt-1 text-[10px] leading-4 text-slate-500">1 intervention requires action today</div>
          </div>
        </div>
      )}

      {/* System Admin — system status widget */}
      {user.role === 'System Administrator' && (
        <div className="px-3 py-2.5 border-t border-slate-100">
          <div className="bg-green-50 border border-green-200 rounded-[5px] px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <MonitorCheck size={11} className="text-green-600 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-green-700 uppercase tracking-[0.08em]">System Status</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
              <span className="text-green-800 font-semibold">All Systems Operational</span>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline status widget — Data/AI Analyst only */}
      {user.role === 'Data / AI Analyst' && (
        <div className="px-3 py-2.5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-[5px] px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={11} className="text-slate-400 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">System Status</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
              <span className="font-medium">Pipeline:</span>
              <span className="text-green-700 font-semibold">Ready</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="font-medium">Model:</span>
              <span className="text-indigo-700 font-semibold font-mono">v2.3 Active</span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400">ERIS workspace · Demo environment</div>
    </aside>
  );
}

export function AppShell({ children, breadcrumb }: { children: ReactNode; breadcrumb?: string[] }) {
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
    <div className="flex h-screen overflow-hidden bg-[#F6F8FC]">
      <a href="#main-content" className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition focus:translate-y-0">Skip to main content</a>
      {sidebarOpen && (
        <>
          <button type="button" aria-label="Close navigation" onClick={closeMobileSidebar} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden" />
          <Sidebar onNavigate={closeMobileSidebar} />
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <EnterpriseHeader breadcrumb={breadcrumb} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} links={NAV_BY_ROLE} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.045),transparent_26rem)] outline-none">
          <div className="eris-content mx-auto w-full max-w-[1480px] p-4 sm:p-5 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


