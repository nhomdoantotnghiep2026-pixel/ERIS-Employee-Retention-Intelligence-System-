import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader, StatusBadge, Avatar, Input, Select } from '../components/ui';
import { users as initialUsers } from '../data/mockData';
import { Search, Plus, Edit2, UserX, X } from 'lucide-react';

const roles = ['HR Staff', 'HR Manager', 'Data / AI Analyst', 'System Administrator'];
const roleColors: Record<string, string> = {
  'System Administrator': 'bg-violet-50 text-violet-700 border-violet-200',
  'HR Manager': 'bg-blue-50 text-blue-700 border-blue-200',
  'Data / AI Analyst': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'HR Staff': 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function Users() {
  const [userRows, setUserRows] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: roles[0] });

  const filtered = userRows.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: roles[0] });
    setShowModal(true);
  };

  const openEdit = (user: (typeof initialUsers)[number]) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const saveUser = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editingId) {
      setUserRows(rows => rows.map(row => row.id === editingId ? { ...row, name: form.name.trim(), email: form.email.trim(), role: form.role } : row));
    } else {
      setUserRows(rows => [
        {
          id: `u-${Date.now()}`,
          name: form.name.trim(),
          email: form.email.trim(),
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

  const toggleStatus = (id: string) => {
    setUserRows(rows => rows.map(row => row.id === id ? { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' } : row));
  };

  return (
    <AppShell breadcrumb={['Users']}>
      <SectionHeader title="Users" description="Manage system users and their assigned roles.">
        <Button variant="primary" size="sm" onClick={openCreate}><Plus size={13} /> Add User</Button>
      </SectionHeader>

      <div className="flex items-center gap-2 mb-3">
        <Input placeholder="Search users..." value={search} onChange={setSearch} icon={<Search size={13} />} className="w-52" />
        <Select value={roleFilter} onChange={setRoleFilter} options={roles} placeholder="All Roles" />
        <Select value={statusFilter} onChange={setStatusFilter} options={['Active', 'Inactive']} placeholder="All Status" />
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['User', 'Email', 'Role', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 h-[44px]">
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
          </tbody>
        </table>
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
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="user@company.com" className="w-full h-[32px] px-2.5 border border-gray-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]" style={{ borderRadius: '5px' }} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full h-[32px] px-2.5 border border-gray-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]" style={{ borderRadius: '5px' }}>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!form.name.trim() || !form.email.trim()} onClick={saveUser}>{editingId ? 'Save Changes' : 'Create User'}</Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
