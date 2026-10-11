import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, StatusBadge, Button, Tabs } from '../components/ui';
import { useState } from 'react';
import { UserPlus, UserMinus, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const onboardingList = [
  { name: 'Pham Duc Anh', role: 'Backend Engineer', dept: 'Engineering', startDate: 'Oct 1, 2026', buddy: 'Hoang Van E', progress: 60, status: 'Active' },
  { name: 'Le Thi Hoa', role: 'Sales Representative', dept: 'Sales', startDate: 'Sep 28, 2026', buddy: 'Dang Van H', progress: 85, status: 'Active' },
  { name: 'Tran Minh Khoa', role: 'Financial Analyst', dept: 'Finance', startDate: 'Oct 5, 2026', buddy: 'Pham Thi D', progress: 20, status: 'Pending' },
  { name: 'Nguyen Thu Ha', role: 'Marketing Specialist', dept: 'Marketing', startDate: 'Oct 3, 2026', buddy: 'Do Thi L', progress: 35, status: 'Active' },
];

const offboardingList = [
  { name: 'Vo Thi Lan', role: 'Operations Analyst', dept: 'Operations', lastDay: 'Sep 30, 2026', reason: 'Resignation', exitSurvey: 'Completed', status: 'Active' },
  { name: 'Bui Quang Minh', role: 'Software Engineer', dept: 'Engineering', lastDay: 'Oct 15, 2026', reason: 'Resignation', exitSurvey: 'Pending', status: 'Pending' },
];

const checklistItems = [
  { step: 'Send offer letter & welcome email', done: true },
  { step: 'IT equipment provisioning', done: true },
  { step: 'System access & credentials setup', done: true },
  { step: 'Benefits enrollment', done: false },
  { step: 'Department orientation meeting', done: false },
  { step: '30-day check-in scheduled', done: false },
];

const departments = ['Engineering', 'Sales', 'Finance', 'Marketing', 'Operations', 'Human Resources'];
const roleOptionsByDept: Record<string, string[]> = {
  Engineering: ['Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Data Engineer'],
  Sales: ['Sales Representative', 'Account Executive', 'Sales Operations Analyst'],
  Finance: ['Financial Analyst', 'Senior Accountant', 'Payroll Specialist'],
  Marketing: ['Marketing Specialist', 'Content Strategist', 'Campaign Analyst'],
  Operations: ['Operations Analyst', 'Process Coordinator', 'Facilities Specialist'],
  'Human Resources': ['HR Coordinator', 'Talent Acquisition Specialist', 'HR Business Partner'],
};
const buddyOptionsByDept: Record<string, string[]> = {
  Engineering: ['Hoang Van E', 'Bui Thi I', 'Nguyen Van A'],
  Sales: ['Dang Van H', 'Tran Thi B'],
  Finance: ['Pham Thi D', 'Tran Van K'],
  Marketing: ['Do Thi L', 'Nguyen Thi F'],
  Operations: ['Vo Thi Lan', 'Nguyen Van C'],
  'Human Resources': ['Le Thi Manager', 'Vo Thi G'],
};
const candidateShortlist = [
  { name: 'Nguyen Quang Huy', role: 'Backend Engineer', dept: 'Engineering', startDate: 'Oct 10, 2026', buddy: 'Hoang Van E', status: 'Pending' },
  { name: 'Mai Thanh Truc', role: 'Sales Representative', dept: 'Sales', startDate: 'Oct 7, 2026', buddy: 'Dang Van H', status: 'Pending' },
  { name: 'Doan Minh Chau', role: 'Financial Analyst', dept: 'Finance', startDate: 'Oct 14, 2026', buddy: 'Pham Thi D', status: 'Pending' },
  { name: 'Tran Gia Bao', role: 'Marketing Specialist', dept: 'Marketing', startDate: 'Oct 12, 2026', buddy: 'Do Thi L', status: 'Pending' },
];

const emptyHire = {
  name: '',
  role: '',
  dept: 'Engineering',
  startDate: 'Oct 10, 2026',
  buddy: 'Hoang Van E',
  progress: 0,
  status: 'Pending',
};

export default function Onboarding() {
  const [tab, setTab] = useState('Onboarding');
  const [onboarding, setOnboarding] = useState(onboardingList);
  const [checklist, setChecklist] = useState(checklistItems);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [newHire, setNewHire] = useState(emptyHire);
  const [nameFocused, setNameFocused] = useState(false);

  const openHireModal = () => {
    setNewHire(emptyHire);
    setHireModalOpen(true);
  };

  const addHire = () => {
    const name = newHire.name.trim();
    const role = newHire.role.trim();
    if (!name || !role) return;
    setOnboarding(rows => [{ ...newHire, name, role, progress: Number(newHire.progress) }, ...rows]);
    setTab('Onboarding');
    setHireModalOpen(false);
  };
  const toggleChecklist = (step: string) => {
    setChecklist(rows => rows.map(item => item.step === step ? { ...item, done: !item.done } : item));
  };
  const applyCandidate = (candidate: (typeof candidateShortlist)[number]) => {
    setNewHire({ ...emptyHire, ...candidate });
  };
  const setDepartment = (dept: string) => {
    setNewHire(hire => ({
      ...hire,
      dept,
      role: roleOptionsByDept[dept]?.includes(hire.role) ? hire.role : roleOptionsByDept[dept]?.[0] || hire.role,
      buddy: buddyOptionsByDept[dept]?.includes(hire.buddy) ? hire.buddy : buddyOptionsByDept[dept]?.[0] || hire.buddy,
    }));
  };
  const matchingCandidates = candidateShortlist.filter(candidate =>
    !newHire.name.trim() || candidate.name.toLowerCase().includes(newHire.name.toLowerCase())
  );

  return (
    <AppShell breadcrumb={['Workforce', 'Onboarding & Offboarding']}>
      <SectionHeader title="Onboarding & Offboarding" description="Manage new hire onboarding and departure workflows">
        <Button variant="primary" size="sm" onClick={openHireModal}><UserPlus size={13} /> Add New Hire</Button>
      </SectionHeader>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { icon: UserPlus, label: 'Active Onboarding', value: onboarding.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: UserMinus, label: 'Active Offboarding', value: 2, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: CheckCircle, label: 'Completed This Month', value: 6, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-[6px] flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="text-[24px] font-semibold text-slate-900 leading-none">{s.value}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs tabs={['Onboarding', 'Offboarding']} active={tab} onChange={setTab} />

      {tab === 'Onboarding' && (
        <div className="space-y-3">
          {onboarding.map(emp => (
            <Card key={emp.name} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-800">{emp.name}</div>
                    <div className="text-[12px] text-slate-500">{emp.role} · {emp.dept}</div>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-[12px]">
                <div>
                  <span className="text-slate-400">Start Date</span>
                  <div className="font-medium text-slate-700 mt-0.5">{emp.startDate}</div>
                </div>
                <div>
                  <span className="text-slate-400">Buddy</span>
                  <div className="font-medium text-slate-700 mt-0.5">{emp.buddy}</div>
                </div>
                <div>
                  <span className="text-slate-400">Onboarding Progress</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${emp.progress}%` }} />
                    </div>
                    <span className="font-mono font-medium text-slate-700">{emp.progress}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Offboarding' && (
        <div className="space-y-3">
          {offboardingList.map(emp => (
            <Card key={emp.name} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-800">{emp.name}</div>
                    <div className="text-[12px] text-slate-500">{emp.role} · {emp.dept}</div>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-[12px]">
                <div>
                  <span className="text-slate-400">Last Day</span>
                  <div className="font-medium text-slate-700 mt-0.5">{emp.lastDay}</div>
                </div>
                <div>
                  <span className="text-slate-400">Reason</span>
                  <div className="font-medium text-slate-700 mt-0.5">{emp.reason}</div>
                </div>
                <div>
                  <span className="text-slate-400">Exit Survey</span>
                  <div className="mt-0.5">
                    {emp.exitSurvey === 'Completed'
                      ? <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={12} /> Completed</span>
                      : <span className="flex items-center gap-1 text-amber-600 font-medium"><Clock size={12} /> Pending</span>
                    }
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-5">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-slate-800">Standard Onboarding Checklist</div>
              <div className="text-[12px] text-slate-500">Baseline tasks HR tracks for every new hire</div>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">
              {checklist.filter(item => item.done).length}/{checklist.length} completed
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {checklist.map((item, index) => (
              <button
                key={item.step}
                onClick={() => toggleChecklist(item.step)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                  item.done
                    ? 'border-green-200 bg-green-50/60 hover:bg-green-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  item.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.done ? <CheckCircle size={15} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-slate-800">{item.step}</span>
                  <span className={`mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                    item.done ? 'bg-white text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.done ? 'Completed' : 'Pending'}
                  </span>
                </span>
                {!item.done && <AlertCircle size={15} className="flex-shrink-0 text-amber-500" />}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {hireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
          <Card className="w-full max-w-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">Add New Hire</div>
                <div className="mt-1 text-[13px] text-slate-500">Create an onboarding record and assign the first HR buddy.</div>
              </div>
              <button onClick={() => setHireModalOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close add new hire modal">
                <X size={17} />
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-2 text-[13px] font-semibold text-slate-800">Candidate shortlist</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {candidateShortlist.map(candidate => (
                  <button
                    key={candidate.name}
                    onClick={() => applyCandidate(candidate)}
                    className={`rounded-md border px-3 py-2 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 ${
                      newHire.name === candidate.name ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="text-[13px] font-semibold text-slate-800">{candidate.name}</div>
                    <div className="mt-0.5 text-[12px] text-slate-500">{candidate.role} · {candidate.dept}</div>
                    <div className="mt-1 text-[11px] text-slate-400">Starts {candidate.startDate} · Buddy {candidate.buddy}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
              <label className="relative text-[13px] font-medium text-slate-700">
                Employee name
                <input
                  value={newHire.name}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => window.setTimeout(() => setNameFocused(false), 120)}
                  onChange={e => {
                    setNewHire(hire => ({ ...hire, name: e.target.value }));
                    setNameFocused(true);
                  }}
                  placeholder="Search candidate by name..."
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {nameFocused && matchingCandidates.length > 0 && (
                  <div className="absolute left-0 right-0 top-[68px] z-20 max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                    {matchingCandidates.map(candidate => (
                      <button
                        key={candidate.name}
                        type="button"
                        onMouseDown={e => {
                          e.preventDefault();
                          applyCandidate(candidate);
                          setNameFocused(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-indigo-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-slate-800">{candidate.name}</span>
                          <span className="block truncate text-[11px] text-slate-500">{candidate.role} · {candidate.dept}</span>
                        </span>
                        <span className="flex-shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">{candidate.startDate}</span>
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <label className="text-[13px] font-medium text-slate-700">
                Job role
                <select
                  value={newHire.role}
                  onChange={e => setNewHire(hire => ({ ...hire, role: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select job role</option>
                  {(roleOptionsByDept[newHire.dept] || []).map(role => <option key={role}>{role}</option>)}
                </select>
              </label>
              <label className="text-[13px] font-medium text-slate-700">
                Department
                <select
                  value={newHire.dept}
                  onChange={e => setDepartment(e.target.value)}
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {departments.map(dept => <option key={dept}>{dept}</option>)}
                </select>
              </label>
              <label className="text-[13px] font-medium text-slate-700">
                Start date
                <input
                  value={newHire.startDate}
                  onChange={e => setNewHire(hire => ({ ...hire, startDate: e.target.value }))}
                  placeholder="Oct 10, 2026"
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="text-[13px] font-medium text-slate-700">
                Buddy
                <select
                  value={newHire.buddy}
                  onChange={e => setNewHire(hire => ({ ...hire, buddy: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {(buddyOptionsByDept[newHire.dept] || []).map(buddy => <option key={buddy}>{buddy}</option>)}
                </select>
              </label>
              <label className="text-[13px] font-medium text-slate-700">
                Status
                <select
                  value={newHire.status}
                  onChange={e => setNewHire(hire => ({ ...hire, status: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {['Pending', 'Active'].map(status => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-[12px] text-slate-500">Required fields: employee name and job role.</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setHireModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={addHire} disabled={!newHire.name.trim() || !newHire.role.trim()}>
                  <UserPlus size={13} /> Create onboarding
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
