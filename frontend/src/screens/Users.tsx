import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, StatusBadge, Avatar, Input, Select, ConfirmationDialog, Pagination } from '../components/ui';
import { users as initialUsers } from '../data/mockData';
import { Search, Plus, Edit2, UserX, X, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const roles = ['HR', 'Data / AI Analyst', 'System Administrator', 'Employee / ESS'];
const USERS_STORAGE_KEY = 'eris-admin-users-v1';
const roleColors: Record<string, string> = {
  'System Administrator': 'bg-violet-50 text-violet-700 border-violet-200',
  'HR': 'bg-orange-50 text-orange-700 border-orange-200',
  'Data / AI Analyst': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Employee / ESS': 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Users() {
  const [userRows, setUserRows] = useState<typeof initialUsers>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return Array.isArray(parsed) ? parsed : initialUsers;
    } catch {
      return initialUsers;
    }
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: roles[0] });
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState<{ title: string; description: string; action: () => void; tone?: 'default' | 'danger'; confirmLabel?: string } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const { t } = useLanguage();

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(userRows));
  }, [userRows]);

  const filtered = userRows.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: roles[0] });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (user: (typeof initialUsers)[number]) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    setFormError('');
    setShowModal(true);
  };

  const saveUser = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (userRows.some(row => row.id !== editingId && row.email.toLowerCase() === email)) {
      setFormError('A user with this email address already exists.');
      return;
    }
    setFormError('');
    const applySave = () => {
      if (editingId) {
      setUserRows(rows => rows.map(row => row.id === editingId ? { ...row, name: form.name.trim(), email, role: form.role } : row));
      } else {
      setUserRows(rows => [
        {
          id: `u-${Date.now()}`,
          name: form.name.trim(),
          email,
          role: form.role,
          status: 'Active',
          lastLogin: 'Just now',
          created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
        ...rows,
      ]);
      }
      setShowModal(false);
    };

    if (editingId) {
      setConfirm({
        title: 'Confirm role update',
        description: 'Role or account information changes affect what this user can access. Do you want to save these changes?',
        confirmLabel: 'Save Changes',
        action: applySave,
      });
      return;
    }

    applySave();
  };

  const toggleStatus = (id: string) => {
    const target = userRows.find(row => row.id === id);
    if (!target) return;
    const deactivating = target.status === 'Active';
    setConfirm({
      title: deactivating ? 'Confirm account deactivation' : 'Confirm account activation',
      description: deactivating ? 'This user will lose access to ERIS until an administrator activates the account again.' : 'This user will regain access to ERIS based on the assigned role.',
      confirmLabel: deactivating ? 'Deactivate' : 'Activate',
      tone: deactivating ? 'danger' : 'default',
      action: () => setUserRows(rows => rows.map(row => row.id === id ? { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' } : row)),
    });
  };

  return (
    <AppShell breadcrumb={['Users']}>
      <SectionHeader title="Users" description="Manage system users and their assigned roles.">
        <Button variant="primary" size="sm" onClick={openCreate}><Plus size={13} /> Add User</Button>
      </SectionHeader>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Input placeholder={t('Search users...')} value={search} onChange={v => { setSearch(v); setPage(1); }} icon={<Search size={15} />} className="w-full sm:w-64" />
            <Select ariaLabel={t('Filter by role')} value={roleFilter} onChange={v => { setRoleFilter(v); setPage(1); }} options={roles} placeholder={t('All Roles')} />
            <Select ariaLabel={t('Filter by status')} value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={['Active', 'Inactive']} placeholder={t('All Status')} />
            {(search || roleFilter || statusFilter) && <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }}><RotateCcw size={14} />{t('Reset')}</Button>}
          </div>
          <div className="text-xs font-medium text-slate-500"><b className="text-slate-800">{filtered.length}</b> {t('users found')}</div>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-[920px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['User', 'Email', 'Role', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="h-14 px-3">
                  <div className="flex items-center gap-2">
                    <Avatar initials={u.name.split(' ').map(n => n[0]).join('').slice(0, 2)} size="sm" />
                    <span className="text-[13px] font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-3 h-[44px] text-[13px] text-gray-500">{u.email}</td>
                <td className="px-3 h-[44px]">
                  <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded border ${roleColors[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 h-[44px]"><StatusBadge status={u.status} /></td>
                <td className="px-3 h-[44px] text-[12px] text-gray-400">{u.lastLogin}</td>
                <td className="px-3 h-[44px] text-[12px] text-gray-400">{u.created}</td>
                <td className="px-3 h-[44px]">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" aria-label={`Edit ${u.name}`} onClick={() => openEdit(u)}><Edit2 size={12} /></Button>
                    <Button variant="ghost" size="sm" aria-label={`${u.status === 'Active' ? 'Deactivate' : 'Activate'} ${u.name}`} onClick={() => toggleStatus(u.id)}><UserX size={12} className={u.status === 'Active' ? 'text-red-400' : 'text-green-500'} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!paged.length && <tr><td colSpan={7} className="px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Search size={20} /></div><p className="mt-3 font-semibold text-slate-700">{t('No users found')}</p><p className="mt-1 text-xs text-slate-500">{t('Try changing or resetting the current filters.')}</p></td></tr>}
          </tbody>
        </table>
        </div>
        <div className="border-t border-slate-100 px-4 pb-4">
          <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-sm" style={{ borderRadius: '7px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-[15px] font-semibold text-gray-900">{editingId ? 'Edit User' : 'Add New User'}</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100" style={{ borderRadius: '4px' }}>
                <X size={14} />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} type="text" placeholder="Enter full name" className="w-full h-[32px] px-2.5 border border-gray-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]" style={{ borderRadius: '5px' }} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Email Address</label>
                <input value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setFormError(''); }} type="email" placeholder="user@company.com" className="w-full h-[32px] px-2.5 border border-gray-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]" style={{ borderRadius: '5px' }} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full h-[32px] px-2.5 border border-gray-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]" style={{ borderRadius: '5px' }}>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {formError && <p role="alert" className="text-xs font-semibold text-red-600">{formError}</p>}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!form.name.trim() || !form.email.trim()} onClick={saveUser}>{editingId ? 'Save Changes' : 'Create User'}</Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        description={confirm?.description || ''}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        tone={confirm?.tone || 'default'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </AppShell>
  );
}
