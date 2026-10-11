import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, Button } from '../components/ui';
import { MonitorCheck, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

type HealthStatus = 'Operational' | 'Degraded' | 'Outage';

interface ServiceStatus {
  service: string;
  category: string;
  status: HealthStatus;
  uptime: string;
  latency: string;
  lastChecked: string;
}

const services: ServiceStatus[] = [
  { service: 'ERIS Core API', category: 'Application', status: 'Operational', uptime: '99.97%', latency: '42ms', lastChecked: '30s ago' },
  { service: 'Authentication Service', category: 'Application', status: 'Operational', uptime: '100%', latency: '18ms', lastChecked: '30s ago' },
  { service: 'HRIS Sync Connector', category: 'Integrations', status: 'Operational', uptime: '99.91%', latency: '210ms', lastChecked: '1m ago' },
  { service: 'ML Inference Engine', category: 'AI / ML', status: 'Operational', uptime: '99.85%', latency: '380ms', lastChecked: '1m ago' },
  { service: 'ML Feature Store', category: 'AI / ML', status: 'Degraded', uptime: '98.40%', latency: '—', lastChecked: '2m ago' },
  { service: 'PostgreSQL (Primary)', category: 'Database', status: 'Operational', uptime: '99.99%', latency: '6ms', lastChecked: '30s ago' },
  { service: 'Redis Cache', category: 'Database', status: 'Operational', uptime: '100%', latency: '1ms', lastChecked: '30s ago' },
  { service: 'File Storage (S3)', category: 'Storage', status: 'Operational', uptime: '100%', latency: '95ms', lastChecked: '2m ago' },
  { service: 'Email Notification Service', category: 'Notifications', status: 'Operational', uptime: '99.80%', latency: '140ms', lastChecked: '5m ago' },
];

const incidents = [
  { title: 'ML Feature Store — Connection timeout', time: 'Sep 23, 2026 04:05', severity: 'Medium', status: 'Investigating' },
  { title: 'HRIS Sync — Brief latency spike (resolved)', time: 'Sep 21, 2026 02:10', severity: 'Low', status: 'Resolved' },
];

const statusConfig: Record<HealthStatus, { icon: typeof CheckCircle; text: string; dot: string; bg: string }> = {
  Operational: { icon: CheckCircle, text: 'text-green-600', dot: 'bg-green-500', bg: 'bg-green-50' },
  Degraded: { icon: AlertCircle, text: 'text-amber-600', dot: 'bg-amber-400', bg: 'bg-amber-50' },
  Outage: { icon: AlertCircle, text: 'text-red-600', dot: 'bg-red-500', bg: 'bg-red-50' },
};

const categories = Array.from(new Set(services.map(s => s.category)));

function ServiceRow({ service: svc }: { service: ServiceStatus }) {
  const cfg = statusConfig[svc.status];
  const Icon = cfg.icon;

  return (
    <div className="grid min-h-[48px] grid-cols-1 gap-2 border-t border-slate-100 px-4 py-3 text-[13px] transition-colors first:border-t-0 hover:bg-slate-50/70 md:grid-cols-[minmax(220px,1.65fr)_156px_172px_164px_92px] md:items-center md:gap-5 md:py-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.dot} ${svc.status === 'Operational' ? 'shadow-[0_0_4px_rgba(34,197,94,0.5)]' : ''}`} />
        <span className="truncate font-medium text-slate-900">{svc.service}</span>
      </div>

      <span className={`inline-flex w-fit items-center gap-1 font-semibold md:w-[132px] ${cfg.text}`}>
        <Icon size={14} className="shrink-0" />
        {svc.status}
      </span>

      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-1 text-[12px] text-slate-500 md:grid-cols-[auto_minmax(0,1fr)]">
        <span className="font-medium text-slate-700">Uptime:</span>
        <span className="font-mono tabular-nums">{svc.uptime}</span>
      </div>

      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-1 text-[12px] text-slate-500 md:grid-cols-[auto_minmax(0,1fr)]">
        <span className="font-medium text-slate-700">Latency:</span>
        <span className="font-mono tabular-nums">{svc.latency}</span>
      </div>

      <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 md:justify-end">
        <Clock size={12} className="shrink-0" />
        <span className="whitespace-nowrap">{svc.lastChecked}</span>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const [serviceRows, setServiceRows] = useState(services);
  const [updatedAt, setUpdatedAt] = useState('just now');
  const operational = serviceRows.filter(s => s.status === 'Operational').length;
  const degraded = serviceRows.filter(s => s.status === 'Degraded').length;
  const overall: HealthStatus = degraded > 0 ? 'Degraded' : 'Operational';
  const overallCfg = statusConfig[overall];

  const refreshHealth = () => {
    setUpdatedAt(new Date().toLocaleTimeString());
    setServiceRows(rows => rows.map(row => row.status === 'Degraded' ? { ...row, status: 'Operational', latency: '86ms', lastChecked: 'now' } : { ...row, lastChecked: 'now' }));
  };

  return (
    <AppShell breadcrumb={['System Operations', 'System Health Monitor']}>
      <SectionHeader title="System Health Monitor" description="Real-time status of all ERIS services and integrations">
        <Button variant="secondary" size="sm" onClick={refreshHealth}><RefreshCw size={13} /> Refresh</Button>
      </SectionHeader>

      {/* Overall status banner */}
      <Card className={`p-4 mb-5 flex items-center gap-3 border-l-4 ${overall === 'Operational' ? 'border-l-green-500' : 'border-l-amber-400'}`}>
        <div className={`w-9 h-9 ${overallCfg.bg} rounded-[6px] flex items-center justify-center flex-shrink-0`}>
          <overallCfg.icon size={18} className={overallCfg.text} />
        </div>
        <div className="flex-1">
          <div className={`text-[15px] font-semibold ${overallCfg.text}`}>
            {overall === 'Operational' ? 'All Systems Operational' : 'Partial Service Degradation'}
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5">
            {operational}/{serviceRows.length} services nominal · Last updated {updatedAt}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
          {[
            { label: 'Operational', value: operational, color: 'text-green-600' },
            { label: 'Degraded', value: degraded, color: 'text-amber-600' },
            { label: 'Outage', value: serviceRows.filter(s => s.status === 'Outage').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label}>
              <div className={`text-[20px] font-semibold leading-none ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Service status by category */}
      <div className="space-y-4 mb-5">
        {categories.map(cat => {
          const catServices = serviceRows.filter(s => s.category === cat);
          return (
            <Card key={cat} className="overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {cat}
              </div>
              <div>
                {catServices.map(svc => <ServiceRow key={svc.service} service={svc} />)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Incident log */}
      <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">Recent Incidents</div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Incident', 'Time', 'Severity', 'Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {incidents.map(inc => (
              <tr key={inc.title} className="hover:bg-slate-50/60">
                <td className="px-4 h-[48px] text-[13px] font-medium text-slate-800">{inc.title}</td>
                <td className="px-4 h-[48px] text-[12px] text-slate-500">{inc.time}</td>
                <td className="px-4 h-[48px]">
                  <span className={`text-[12px] font-semibold ${inc.severity === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}>{inc.severity}</span>
                </td>
                <td className="px-4 h-[48px]">
                  <span className={`text-[12px] font-medium ${inc.status === 'Resolved' ? 'text-green-600' : 'text-amber-600'}`}>{inc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
