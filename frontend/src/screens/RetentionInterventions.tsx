import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, RiskBadge, Button, Tabs, AIAdvisoryBanner } from '../components/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, ArrowUpCircle, Clock, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { employees } from '../data/mockData';

type InterventionStatus = 'In Progress' | 'Action Required' | 'Resolved';

interface Intervention {
  id: string;
  empName: string;
  empId: string;
  dept: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  status: InterventionStatus;
  type: string;
  assignedTo: string;
  createdDate: string;
  nextAction: string;
  notes: string;
}

const interventions: Intervention[] = [
  { id: '1', empName: 'Nguyen Van A', empId: '1', dept: 'Engineering', riskLevel: 'High', riskScore: 78, status: 'In Progress', type: '1-on-1 Meeting', assignedTo: 'Le Thi Manager', createdDate: 'Sep 15, 2026', nextAction: 'Sep 28, 2026', notes: 'Discussed workload concerns and overtime. Follow-up scheduled.' },
  { id: '2', empName: 'Tran Thi B', empId: '2', dept: 'Sales', riskLevel: 'High', riskScore: 82, status: 'Action Required', type: 'Action Plan', assignedTo: 'Le Thi Manager', createdDate: 'Sep 10, 2026', nextAction: 'Sep 25, 2026', notes: 'Salary review pending. Needs immediate escalation to Director.' },
  { id: '3', empName: 'Nguyen Thi F', empId: '6', dept: 'Marketing', riskLevel: 'High', riskScore: 71, status: 'Resolved', type: '1-on-1 Meeting', assignedTo: 'Le Thi Manager', createdDate: 'Aug 20, 2026', nextAction: '—', notes: 'Transfer to new team approved. Employee satisfaction improved.' },
  { id: '4', empName: 'Bui Thi I', empId: '9', dept: 'Engineering', riskLevel: 'High', riskScore: 69, status: 'In Progress', type: 'Action Plan', assignedTo: 'Le Thi Manager', createdDate: 'Sep 18, 2026', nextAction: 'Oct 1, 2026', notes: 'Workload redistribution underway. Performance review in Q4.' },
];

const statusStyles: Record<InterventionStatus, string> = {
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Action Required': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Resolved': 'bg-green-50 text-green-700 border border-green-200',
};

const statusIcon: Record<InterventionStatus, typeof Clock> = {
  'In Progress': Clock,
  'Action Required': AlertCircle,
  'Resolved': CheckCircle,
};

export default function RetentionInterventions() {
  const navigate = useNavigate();
  const [items, setItems] = useState(interventions);
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState<Intervention | null>(interventions[0]);
  const [modal, setModal] = useState<'new' | 'schedule' | 'plan' | 'escalate' | null>(null);
  const [form, setForm] = useState({
    empName: 'Nguyen Van A',
    empId: '1',
    dept: 'Engineering',
    riskScore: 78,
    type: '1-on-1 Meeting',
    assignedTo: 'Le Thi Manager',
    nextAction: '2026-10-05',
    notes: '',
  });
  const [employeeFocused, setEmployeeFocused] = useState(false);
  const [escalation, setEscalation] = useState({
    owner: 'Director of People Operations',
    priority: 'High',
    deadline: '2026-10-02',
    reason: 'Requires leadership decision beyond HR Manager authority.',
  });

  const tabs = ['All', 'In Progress', 'Action Required', 'Resolved'];
  const filtered = tab === 'All' ? items : items.filter(i => i.status === tab);
  const departments = Array.from(new Set(employees.map(emp => emp.department))).sort();
  const employeeQuery = form.empName.trim().toLowerCase();
  const employeeSuggestions = employees
    .filter(emp => {
      if (!employeeQuery) return false;
      return [emp.name, emp.employeeId, emp.email, emp.department, emp.role].some(value => value.toLowerCase().includes(employeeQuery));
    })
    .slice(0, 6);
  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const selectEmployee = (emp: (typeof employees)[number]) => {
    setForm(current => ({
      ...current,
      empName: emp.name,
      empId: emp.id,
      dept: emp.department,
      riskScore: emp.riskScore,
      notes: current.notes || `Intervention opened for ${emp.name} based on ${emp.riskLevel.toLowerCase()} attrition risk (${emp.riskScore}%).`,
    }));
    setEmployeeFocused(false);
  };
  const openNewIntervention = () => {
    setForm({
      empName: '',
      empId: '',
      dept: departments[0] || '',
      riskScore: 65,
      type: '1-on-1 Meeting',
      assignedTo: 'Le Thi Manager',
      nextAction: '2026-10-05',
      notes: '',
    });
    setEmployeeFocused(false);
    setModal('new');
  };
  const newIntervention = () => {
    const next = {
      id: `int-${Date.now()}`,
      empName: form.empName.trim(),
      empId: form.empId,
      dept: form.dept.trim(),
      riskLevel: (form.riskScore >= 65 ? 'High' : form.riskScore >= 35 ? 'Medium' : 'Low') as Intervention['riskLevel'],
      riskScore: Number(form.riskScore),
      status: 'In Progress' as const,
      type: form.type,
      assignedTo: form.assignedTo.trim(),
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nextAction: formatDate(form.nextAction),
      notes: form.notes.trim() || 'New intervention created from HR workflow.',
    };
    setItems(rows => [next, ...rows]);
    setSelected(next);
    setTab('All');
    setModal(null);
  };
  const updateSelected = (status: InterventionStatus, notes: string) => {
    if (!selected) return;
    const updated = { ...selected, status, notes };
    setSelected(updated);
    setItems(rows => rows.map(item => item.id === selected.id ? updated : item));
    setModal(null);
  };
  const openSchedule = () => {
    if (!selected) return;
    setForm(current => ({
      ...current,
      empName: selected.empName,
      empId: selected.empId,
      dept: selected.dept,
      riskScore: selected.riskScore,
      type: '1-on-1 Meeting',
      assignedTo: selected.assignedTo,
      nextAction: '2026-10-05',
      notes: selected.notes,
    }));
    setModal('schedule');
  };
  const openPlan = () => {
    if (!selected) return;
    setForm(current => ({
      ...current,
      empName: selected.empName,
      empId: selected.empId,
      dept: selected.dept,
      riskScore: selected.riskScore,
      type: selected.type,
      assignedTo: selected.assignedTo,
      nextAction: '2026-10-05',
      notes: selected.notes,
    }));
    setModal('plan');
  };
  const openEscalate = () => {
    if (!selected) return;
    setEscalation({
      owner: selected.dept === 'Sales' ? 'Sales Director' : selected.dept === 'Engineering' ? 'Engineering Director' : 'Director of People Operations',
      priority: selected.riskScore >= 80 ? 'Critical' : 'High',
      deadline: '2026-10-02',
      reason: selected.riskScore >= 80
        ? 'Risk score is critical and requires leadership-level retention decision.'
        : 'Intervention requires approval or action beyond HR Manager authority.',
    });
    setModal('escalate');
  };
  const submitEscalation = () => {
    if (!selected) return;
    const deadline = formatDate(escalation.deadline);
    const updatedNotes = `${selected.notes} Escalated to ${escalation.owner}. Priority: ${escalation.priority}. Response due: ${deadline}. Reason: ${escalation.reason}`;
    const updated = {
      ...selected,
      status: 'Action Required' as const,
      assignedTo: escalation.owner,
      nextAction: deadline,
      notes: updatedNotes,
    };
    setSelected(updated);
    setItems(rows => rows.map(item => item.id === selected.id ? updated : item));
    setTab('All');
    setModal(null);
  };

  return (
    <AppShell breadcrumb={['Performance & Retention', 'Retention Interventions']}>
      <SectionHeader title="Retention Interventions" description="1-on-1 meetings, action plans, and escalations">
        <Button variant="primary" size="sm" onClick={openNewIntervention}><Plus size={13} /> New Intervention</Button>
      </SectionHeader>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Active', value: items.filter(i => i.status !== 'Resolved').length, color: 'text-slate-900' },
          { label: 'In Progress', value: items.filter(i => i.status === 'In Progress').length, color: 'text-blue-600' },
          { label: 'Action Required', value: items.filter(i => i.status === 'Action Required').length, color: 'text-amber-600' },
          { label: 'Resolved (30d)', value: items.filter(i => i.status === 'Resolved').length, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-[28px] font-semibold leading-none ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={t => { setTab(t); setSelected(null); }} />

      <div className="grid grid-cols-5 gap-4">
        {/* List */}
        <div className="col-span-2 space-y-2">
          {filtered.map(item => {
            const Icon = statusIcon[item.status];
            return (
              <Card
                key={item.id}
                className={`p-3.5 cursor-pointer transition-all ${selected?.id === item.id ? 'ring-1 ring-[#4F46E5] border-[#4F46E5]' : 'hover:border-slate-300'}`}
                onClick={() => setSelected(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                      {item.empName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800">{item.empName}</div>
                      <div className="text-[11px] text-slate-400">{item.dept}</div>
                    </div>
                  </div>
                  <RiskBadge level={item.riskLevel} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium h-[20px] ${statusStyles[item.status]}`}>
                    <Icon size={10} /> {item.status}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.type}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="col-span-3">
            <Card className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[18px] font-semibold text-slate-900">{selected.empName}</div>
                  <div className="text-[13px] text-slate-500 mt-0.5">{selected.dept} · {selected.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={selected.riskLevel} score={selected.riskScore} />
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-medium ${statusStyles[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-[12px]">
                {[
                  ['Assigned To', selected.assignedTo],
                  ['Created', selected.createdDate],
                  ['Next Action Due', selected.nextAction],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-[5px] p-2.5">
                    <div className="text-slate-400 mb-0.5">{label}</div>
                    <div className="font-medium text-slate-700">{val}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="text-[12px] font-medium text-slate-500 mb-1.5">Notes</div>
                <div className="text-[13px] text-slate-700 bg-slate-50 p-3 rounded-[5px]">{selected.notes}</div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <Button variant="primary" size="sm" onClick={openSchedule}>
                  <Calendar size={13} /> Schedule 1-on-1
                </Button>
                <Button variant="secondary" size="sm" onClick={openPlan}>
                  <FileText size={13} /> Update Action Plan
                </Button>
                <Button variant="secondary" size="sm" className="ml-auto" onClick={openEscalate}>
                  <ArrowUpCircle size={13} /> Escalate to Director
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-4"><AIAdvisoryBanner /></div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <Card className="w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">
                  {modal === 'new' ? 'New Intervention' : modal === 'schedule' ? 'Schedule 1-on-1' : modal === 'plan' ? 'Update Action Plan' : 'Escalate to Director'}
                </div>
                <div className="text-[12px] text-slate-500">
                  {modal === 'escalate' ? 'Send this case to a leader with reason, priority, and response deadline.' : 'Create a concrete follow-up action for a high-risk employee.'}
                </div>
              </div>
              <button type="button" onClick={() => setModal(null)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100" aria-label="Close intervention dialog">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              {modal === 'escalate' && selected && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-slate-900">{selected.empName}</div>
                      <div className="text-[12px] text-slate-600">{selected.dept} - {selected.type}</div>
                    </div>
                    <RiskBadge level={selected.riskLevel} score={selected.riskScore} />
                  </div>
                </div>
              )}
              {modal === 'new' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Employee</label>
                    <div className="relative">
                      <input
                        value={form.empName}
                        onChange={e => {
                          setForm({ ...form, empName: e.target.value });
                          setEmployeeFocused(true);
                        }}
                        onFocus={() => setEmployeeFocused(Boolean(form.empName.trim()))}
                        onBlur={() => window.setTimeout(() => setEmployeeFocused(false), 120)}
                        className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        placeholder="Search employee by name, id, email..."
                      />
                      {employeeFocused && employeeQuery.length > 0 && (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                          {employeeSuggestions.length > 0 ? employeeSuggestions.map(emp => (
                            <button
                              type="button"
                              key={emp.id}
                              onMouseDown={event => {
                                event.preventDefault();
                                selectEmployee(emp);
                              }}
                              className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-slate-800">{emp.name}</span>
                                <span className="block truncate text-[11px] text-slate-400">{emp.employeeId} - {emp.department} - {emp.email}</span>
                              </span>
                              <RiskBadge level={emp.riskLevel} score={emp.riskScore} />
                            </button>
                          )) : (
                            <div className="px-3 py-3 text-[13px] text-slate-400">No matching employees</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Department</label>
                    <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                      {departments.map(dept => <option key={dept}>{dept}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {modal !== 'escalate' ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-slate-700">Intervention type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    {['1-on-1 Meeting', 'Action Plan', 'Salary Review', 'Workload Review', 'Career Path Discussion'].map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-slate-700">Next action date</label>
                  <input type="date" value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div> : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[13px] font-medium text-slate-700">Escalate to</label>
                      <select value={escalation.owner} onChange={e => setEscalation({ ...escalation, owner: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                        {['Director of People Operations', 'Engineering Director', 'Sales Director', 'Department Head', 'CHRO'].map(owner => <option key={owner}>{owner}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[13px] font-medium text-slate-700">Priority</label>
                      <select value={escalation.priority} onChange={e => setEscalation({ ...escalation, priority: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                        {['High', 'Critical'].map(priority => <option key={priority}>{priority}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Response deadline</label>
                    <input type="date" value={escalation.deadline} onChange={e => setEscalation({ ...escalation, deadline: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Escalation reason</label>
                    <textarea value={escalation.reason} onChange={e => setEscalation({ ...escalation, reason: e.target.value })} rows={4} className="w-full rounded border border-slate-300 px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Explain why this case requires leadership approval..." />
                  </div>
                </>
              )}
              {modal !== 'escalate' && (
                <>
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Assigned to</label>
                    <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="h-10 w-full rounded border border-slate-300 px-3 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-slate-700">Notes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} className="w-full rounded border border-slate-300 px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Add context, agreed action, or follow-up requirement..." />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              {modal === 'new' ? (
                <Button variant="primary" disabled={!form.empName.trim() || !form.dept.trim() || !form.nextAction} onClick={newIntervention}>Create Intervention</Button>
              ) : modal === 'schedule' ? (
                <Button variant="primary" disabled={!form.nextAction} onClick={() => updateSelected('In Progress', `${form.notes || selected?.notes || ''} 1-on-1 scheduled for ${formatDate(form.nextAction)}.`)}>Save Schedule</Button>
              ) : modal === 'escalate' ? (
                <Button variant="danger" disabled={!escalation.owner || !escalation.deadline || !escalation.reason.trim()} onClick={submitEscalation}>Submit Escalation</Button>
              ) : (
                <Button variant="primary" onClick={() => updateSelected('In Progress', form.notes || `${selected?.notes} Action plan updated.`)}>Save Action Plan</Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
