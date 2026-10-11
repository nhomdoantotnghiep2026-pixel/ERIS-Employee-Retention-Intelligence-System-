import { type ReactNode, type ButtonHTMLAttributes, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Risk Badge — compact enterprise chip
export function RiskBadge({ level, score }: { level: string; score?: number }) {
  const { t } = useLanguage();
  const styles: Record<string, string> = {
    High: 'bg-red-100 text-red-800 border border-red-300 shadow-[inset_3px_0_0_#DC2626]',
    Medium: 'bg-amber-100 text-amber-800 border border-amber-300 shadow-[inset_3px_0_0_#D97706]',
    Low: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  };
  const dots: Record<string, string> = {
    High: 'bg-red-700', Medium: 'bg-amber-700', Low: 'bg-emerald-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold leading-none h-[22px] ${styles[level] || styles.Low}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[level] || dots.Low}`} />
      {t(`${level} Risk Label`)}{score !== undefined && <span className="ml-0.5 font-mono font-semibold tabular-nums">{score}%</span>}
    </span>
  );
}

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const styles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Inactive: 'bg-slate-200 text-slate-700 border border-slate-300',
    Valid: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Warning: 'bg-amber-100 text-amber-800 border border-amber-300',
    Invalid: 'bg-red-100 text-red-800 border border-red-300',
    Pending: 'bg-blue-100 text-blue-800 border border-blue-300',
    Success: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    Error: 'bg-red-100 text-red-800 border border-red-300',
    Resolved: 'bg-slate-200 text-slate-700 border border-slate-300',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold leading-none h-[22px] ${styles[status] || 'bg-slate-200 text-slate-700'}`}>
      {t(status)}
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
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98]';
  const sizes = { sm: 'px-3 h-11 text-sm sm:h-9 sm:text-[13px]', md: 'px-4 h-11 text-sm sm:h-10 sm:text-[13px]' };
  const variants = {
    primary: 'bg-[#F97316] text-white shadow-sm shadow-orange-600/20 hover:bg-[#EA580C] hover:shadow-md',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    link: 'text-[#F97316] hover:underline p-0 h-auto',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Card — flat enterprise card
export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`rounded-[20px] border border-white/80 bg-white shadow-[0_8px_28px_rgba(30,41,59,0.06)] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Section header
export function SectionHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="relative mb-5 flex flex-col gap-4 overflow-hidden rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_8px_28px_rgba(30,41,59,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <div className="mb-2 h-1 w-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
        <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-slate-900">{t(title)}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{t(description)}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">{children}</div>}
    </div>
  );
}

// AI Advisory Banner
export function AIAdvisoryBanner() {
  const { t } = useLanguage();
  return (
    <div className="flex items-start gap-2 border-l-4 border-blue-600 bg-blue-100 p-3 text-[13px] font-medium text-blue-950 shadow-[0_1px_2px_rgba(30,64,175,0.08)]" style={{ borderRadius: '6px' }}>
      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{t('AI-generated risk information is advisory and intended to support HR review. Final employment and retention decisions remain the responsibility of authorized HR personnel.')}</span>
    </div>
  );
}

// Tabs
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  const { t } = useLanguage();
  return (
    <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`min-h-11 whitespace-nowrap px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-500 ${active === tab ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <div className="text-sm font-medium text-gray-600 mb-1">{t(title)}</div>
      {description && <div className="text-[13px] text-gray-400 max-w-xs">{t(description)}</div>}
    </div>
  );
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id="confirmation-title" className="text-[16px] font-semibold text-slate-900">{t(title)}</h2>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">{t(description)}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <Button variant="secondary" onClick={onCancel}>{t(cancelLabel)}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{t(confirmLabel)}</Button>
        </div>
      </div>
    </div>
  );
}

// Pagination
export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const { t } = useLanguage();
  const pages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="mt-4 flex flex-col gap-3 text-[13px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <span>{t('Showing')} {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} {t('of')} {total}</span>
      <div className="flex flex-wrap gap-1">
        <button aria-label={t('Previous page')} disabled={page === 1} onClick={() => onChange(page - 1)} className="min-h-10 min-w-10 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs focus-visible:outline-2 focus-visible:outline-orange-500" style={{ borderRadius: '6px' }}>‹</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button aria-label={`${t('Page')} ${p}`} aria-current={p === page ? 'page' : undefined} key={p} onClick={() => onChange(p)} className={`min-h-10 min-w-10 border text-xs focus-visible:outline-2 focus-visible:outline-orange-500 ${p === page ? 'bg-[#F97316] text-white border-[#F97316]' : 'border-slate-200 hover:bg-slate-50'}`} style={{ borderRadius: '6px' }}>{p}</button>
        ))}
        <button aria-label={t('Next page')} disabled={page === pages} onClick={() => onChange(page + 1)} className="min-h-10 min-w-10 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs focus-visible:outline-2 focus-visible:outline-orange-500" style={{ borderRadius: '6px' }}>›</button>
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
        className={`h-11 border border-slate-300 bg-white text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#F97316] w-full sm:h-10 sm:text-[13px] ${icon ? 'pl-9 pr-3' : 'px-3'}`}
        style={{ borderRadius: '10px' }}
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
      className={`h-11 border border-slate-300 bg-white px-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#F97316] cursor-pointer sm:h-10 sm:text-[13px] ${className}`}
      style={{ borderRadius: '10px' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// Table helpers
export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th scope="col" className={`px-3 py-3 text-left text-[11px] font-bold text-slate-600 uppercase tracking-[0.055em] whitespace-nowrap bg-[#F8FAFC] ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`h-[56px] px-3 py-2 text-[13px] text-slate-700 ${className}`}>{children}</td>;
}

// Trend
export function TrendIcon({ trend }: { trend: string }) {
  const { t } = useLanguage();
  if (trend === 'up') return <span className="text-red-700 text-xs font-semibold">↑ {t('Rising')}</span>;
  if (trend === 'down') return <span className="text-emerald-700 text-xs font-semibold">↓ {t('Falling')}</span>;
  return <span className="text-slate-600 text-xs font-semibold">→ {t('Stable')}</span>;
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
