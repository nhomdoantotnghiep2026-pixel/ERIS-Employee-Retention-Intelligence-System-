import { type ReactNode, type ButtonHTMLAttributes } from 'react';

// Risk Badge — compact enterprise chip
export function RiskBadge({ level, score }: { level: string; score?: number }) {
  const styles: Record<string, string> = {
    High: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
    Medium: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    Low: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]',
  };
  const dots: Record<string, string> = {
    High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-green-500',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium leading-none h-[22px] ${styles[level] || styles.Low}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[level] || dots.Low}`} />
      {level} Risk{score !== undefined && <span className="ml-0.5 font-mono font-semibold tabular-nums">{score}%</span>}
    </span>
  );
}

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border border-green-200',
    Inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
    Valid: 'bg-green-50 text-green-700 border border-green-200',
    Warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    Invalid: 'bg-red-50 text-red-700 border border-red-200',
    Pending: 'bg-blue-50 text-blue-600 border border-blue-200',
    Success: 'bg-green-50 text-green-700 border border-green-200',
    Error: 'bg-red-50 text-red-700 border border-red-200',
    Resolved: 'bg-gray-100 text-gray-500 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium leading-none h-[22px] ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// Avatar
export function Avatar({ initials, size = 'sm', color }: { initials: string; size?: 'xs' | 'sm' | 'md' | 'lg'; color?: string }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-xs', lg: 'w-9 h-9 text-sm' };
  const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700'];
  const colorClass = color || colors[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length];
  return (
    <span className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center font-medium flex-shrink-0`}>
      {initials}
    </span>
  );
}

// Buttons — enterprise compact
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';
  const sizes = { sm: 'px-3 h-11 text-sm sm:h-9 sm:text-[13px]', md: 'px-4 h-11 text-sm sm:h-10 sm:text-[13px]' };
  const variants = {
    primary: 'bg-[#4F46E5] text-white hover:bg-[#4338CA]',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    link: 'text-[#4F46E5] hover:underline p-0 h-auto',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} style={{ borderRadius: '5px' }} {...props}>
      {children}
    </button>
  );
}

// Card — flat enterprise card
export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-white border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.045)] ${className}`}
      style={{ borderRadius: '8px' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Section header
export function SectionHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="relative mb-5 flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-white via-white to-indigo-50/45 px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500" />
      <div className="min-w-0 pl-1">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-[13px] leading-5 text-slate-600">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">{children}</div>}
    </div>
  );
}

// AI Advisory Banner
export function AIAdvisoryBanner() {
  return (
    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 text-[13px] text-blue-800" style={{ borderRadius: '6px' }}>
      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>AI-generated risk information is advisory and intended to support HR review. Final employment and retention decisions remain the responsibility of authorized HR personnel.</span>
    </div>
  );
}

// Tabs
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`min-h-11 whitespace-nowrap px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500 ${active === tab ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      {description && <div className="text-[13px] text-gray-400 max-w-xs">{description}</div>}
    </div>
  );
}

// Pagination
export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  return (
    <div className="flex items-center justify-between text-[13px] text-gray-500 mt-3">
      <span>Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}</span>
      <div className="flex gap-1">
        <button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} className="min-h-10 min-w-10 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs focus-visible:outline-2 focus-visible:outline-indigo-500" style={{ borderRadius: '6px' }}>‹</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} key={p} onClick={() => onChange(p)} className={`min-h-10 min-w-10 border text-xs focus-visible:outline-2 focus-visible:outline-indigo-500 ${p === page ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-slate-200 hover:bg-slate-50'}`} style={{ borderRadius: '6px' }}>{p}</button>
        ))}
        <button aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)} className="min-h-10 min-w-10 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs focus-visible:outline-2 focus-visible:outline-indigo-500" style={{ borderRadius: '6px' }}>›</button>
      </div>
    </div>
  );
}

// Input
export function Input({ placeholder, value, onChange, icon, className = '', ariaLabel }: { placeholder?: string; value: string; onChange: (v: string) => void; icon?: ReactNode; className?: string; ariaLabel?: string }) {
  return (
    <div className={`relative ${className}`}>
      {icon && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input
        type="text"
        aria-label={ariaLabel || placeholder || 'Text input'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`h-11 border border-slate-300 bg-white text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#4F46E5] w-full sm:h-10 sm:text-[13px] ${icon ? 'pl-9 pr-3' : 'px-3'}`}
        style={{ borderRadius: '5px' }}
      />
    </div>
  );
}

// Select
export function Select({ value, onChange, options, placeholder, className = '', ariaLabel }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string; ariaLabel?: string }) {
  return (
    <select
      value={value}
      aria-label={ariaLabel || placeholder || 'Select option'}
      onChange={e => onChange(e.target.value)}
      className={`h-11 border border-slate-300 bg-white px-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#4F46E5] cursor-pointer sm:h-10 sm:text-[13px] ${className}`}
      style={{ borderRadius: '5px' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// Table helpers
export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap bg-[#F8FAFC] ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-0 text-[13px] text-slate-700 h-[48px] ${className}`}>{children}</td>;
}

// Trend
export function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-500 text-xs">↑ Rising</span>;
  if (trend === 'down') return <span className="text-green-600 text-xs">↓ Falling</span>;
  return <span className="text-gray-400 text-xs">→ Stable</span>;
}

// Divider
export function Divider({ label }: { label?: string }) {
  if (label) {
    return (
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
    );
  }
  return <div className="h-px bg-gray-100 my-3" />;
}
