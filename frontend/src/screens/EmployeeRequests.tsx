import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Clock3, XCircle } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Button, Card, SectionHeader, StatusBadge, Td, Th } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';
import { listEmployeeRequests, reviewEmployeeRequest, type WorkflowRequest } from '../services/employeeWorkflow';

export default function EmployeeRequests() {
  const { t } = useLanguage();
  const { user } = useRole();
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await listEmployeeRequests());
    } catch {
      setError('Supabase chưa có bảng employee_requests hoặc migration chưa được chạy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRequests(); }, []);

  const review = async (request: WorkflowRequest, status: 'Approved' | 'Rejected') => {
    try {
      const updated = await reviewEmployeeRequest(request.id, status, user.email);
      setRequests(current => current.map(item => item.id === updated.id ? updated : item));
    } catch {
      setError('Không thể cập nhật trạng thái request. Kiểm tra migration và RLS của Supabase.');
    }
  };

  const pending = requests.filter(item => item.status === 'Pending').length;
  return <AppShell breadcrumb={['Workforce', 'Employee Requests']}><SectionHeader title="Employee Requests" description="Review leave, overtime, shift, and remote-work requests submitted by employees."/><div className="mb-5 grid gap-4 sm:grid-cols-3"><Metric icon={Clock3} label="Pending review" value={pending} tone="amber"/><Metric icon={CheckCircle2} label="Approved" value={requests.filter(item => item.status === 'Approved').length} tone="emerald"/><Metric icon={XCircle} label="Rejected" value={requests.filter(item => item.status === 'Rejected').length} tone="red"/></div><Card className="overflow-hidden p-0"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><ClipboardList size={22} className="text-orange-500"/><div><h2 className="font-bold text-slate-900">{t('Approval queue')}</h2><p className="text-sm text-slate-500">{t('HR review is recorded with reviewer and timestamp.')}</p></div></div>{error && <p role="alert" className="m-5 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-900">{t(error)}</p>}{loading ? <p className="p-8 text-sm text-slate-500">{t('Loading requests...')}</p> : requests.length === 0 ? <p className="p-8 text-sm text-slate-500">{t('No requests found.')}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr><Th>Employee</Th><Th>Type</Th><Th>Date</Th><Th>Detail</Th><Th>Status</Th><Th>Action</Th></tr></thead><tbody>{requests.map(request => <tr key={request.id} className="border-t border-slate-100"><Td><div className="font-semibold text-slate-800">{request.employee_name}</div><div className="text-xs text-slate-500">{request.employee_email}</div></Td><Td>{t(request.request_type)}</Td><Td>{request.requested_date}</Td><Td>{request.detail}</Td><Td><StatusBadge status={request.status} /></Td><Td>{request.status === 'Pending' ? <div className="flex gap-2"><Button size="sm" onClick={() => void review(request, 'Approved')}><CheckCircle2 size={15}/>{t('Approve')}</Button><Button size="sm" variant="secondary" onClick={() => void review(request, 'Rejected')}><XCircle size={15}/>{t('Reject')}</Button></div> : <span className="text-xs text-slate-500">{request.reviewer_email || '-'}</span>}</Td></tr>)}</tbody></table></div>}</Card></AppShell>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: number; tone: 'amber' | 'emerald' | 'red' }) {
  const styles = { amber: 'bg-amber-50 text-amber-700', emerald: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700' };
  return <div className={`rounded-2xl p-4 ${styles[tone]}`}><Icon size={20}/><p className="mt-3 text-xs font-bold uppercase">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div>;
}
