import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileSpreadsheet, RefreshCw, Upload, UserPlus } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Button, Card, ConfirmationDialog, Input, Select } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { useEmployees, type EmployeeInput } from '../context/EmployeeContext';

const baseDepartments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Human Resources', 'Finance'];
const baseJobs = ['Software Engineer', 'Sales Representative', 'Marketing Specialist', 'HR Specialist', 'Data Analyst'];

function FlowHeader({ title, description, onBack }: { title: string; description: string; onBack: () => void }) {
  const { t } = useLanguage();
  return <section className="mb-5 rounded-[24px] bg-white p-6 shadow-[0_8px_28px_rgba(30,41,59,0.06)]"><button onClick={onBack} className="mb-4 flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-500 hover:bg-orange-50 hover:text-orange-700"><ArrowLeft size={17}/>{t('Employee Directory')}</button><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">{t('Employee Management')}</p><h1 className="mt-2 text-2xl font-extrabold text-slate-900">{t(title)}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{t(description)}</p></section>;
}

function Steps({ active, labels }: { active: number; labels: string[] }) {
  const { t } = useLanguage();
  return <div className="mb-5 grid gap-2 sm:grid-cols-3">{labels.map((label, index) => <div key={label} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${index === active ? 'border-orange-300 bg-orange-50 text-orange-700' : index < active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === active ? 'bg-orange-500 text-white' : index < active ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>{index < active ? '✓' : index + 1}</span><span className="text-xs font-bold">{t(label)}</span></div>)}</div>;
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let value = '', quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { result.push(value.trim()); value = ''; }
    else value += char;
  }
  result.push(value.trim());
  return result;
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { rows: [] as EmployeeInput[], errors: ['The CSV must contain a header and at least one employee row.'] };
  const headers = splitCsvLine(lines[0]).map(header => header.toLowerCase().replace(/[ _-]/g, ''));
  const find = (...names: string[]) => names.map(name => headers.indexOf(name)).find(index => index >= 0) ?? -1;
  const indexes = { employeeId: find('employeeid', 'id'), firstName: find('firstname'), lastName: find('lastname'), department: find('department'), jobTitle: find('jobtitle', 'role'), email: find('email') };
  const missing = Object.entries(indexes).filter(([key, index]) => key !== 'email' && index < 0).map(([key]) => key);
  if (missing.length) return { rows: [] as EmployeeInput[], errors: [`Missing required columns: ${missing.join(', ')}.`] };
  const rows: EmployeeInput[] = [], errors: string[] = [];
  lines.slice(1).forEach((line, rowIndex) => {
    const values = splitCsvLine(line), read = (index: number) => index >= 0 ? (values[index] || '').trim() : '';
    const row = { employeeId: read(indexes.employeeId), firstName: read(indexes.firstName), lastName: read(indexes.lastName), department: read(indexes.department), jobTitle: read(indexes.jobTitle), email: read(indexes.email) };
    const empty = Object.entries(row).filter(([key, value]) => key !== 'email' && !value).map(([key]) => key);
    if (empty.length) errors.push(`Row ${rowIndex + 2}: missing ${empty.join(', ')}.`); else rows.push(row);
  });
  return { rows, errors };
}

export type EmployeeDataMode = 'add' | 'import' | 'bulk';

export default function EmployeeDataManagement({ mode }: { mode: EmployeeDataMode }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { employees, addEmployee, importEmployees, bulkUpdate } = useEmployees();
  const departments = useMemo(() => [...new Set([...baseDepartments, ...employees.map(item => item.department)])].sort(), [employees]);
  const jobTitles = useMemo(() => [...new Set([...baseJobs, ...employees.map(item => item.role)])].sort(), [employees]);
  const nextId = useMemo(() => `EMP-${String(Math.max(0, ...employees.map(item => Number(item.employeeId.match(/\d+/)?.[0] || 0))) + 1).padStart(3, '0')}`, [employees]);
  const [step, setStep] = useState(0), [confirm, setConfirm] = useState(false), [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [employee, setEmployee] = useState({ firstName: '', lastName: '', employeeId: nextId, department: '', jobTitle: '', supervisor: '', email: '' });
  const [fileName, setFileName] = useState(''), [importRows, setImportRows] = useState<EmployeeInput[]>([]), [importErrors, setImportErrors] = useState<string[]>([]), [importedCount, setImportedCount] = useState<number | null>(null);
  const [bulk, setBulk] = useState({ department: '', jobTitle: '', field: 'Department', value: '' });
  const [bulkUpdatedCount, setBulkUpdatedCount] = useState(0);
  const matches = employees.filter(item => (!bulk.department || item.department === bulk.department) && (!bulk.jobTitle || item.role === bulk.jobTitle));
  const changeOptions = bulk.field === 'Department' ? departments : bulk.field === 'Job Title' ? jobTitles : ['Active', 'Inactive'];

  const createEmployee = () => {
    if (!addEmployee(employee)) { setMessage('Employee ID already exists. Enter a unique ID.'); return; }
    setMessage(''); setSaved(true);
  };
  const readCsv = async (file?: File) => {
    if (!file) return;
    setFileName(file.name); setImportedCount(null);
    if (file.size > 10 * 1024 * 1024) { setImportRows([]); setImportErrors(['The file exceeds the 10 MB limit.']); return; }
    const parsed = parseCsv(await file.text()), known = new Set(employees.map(item => item.employeeId.toLowerCase())), seen = new Set<string>();
    const duplicates = parsed.rows.flatMap(row => { const key = row.employeeId.toLowerCase(); const errors = known.has(key) ? [`Employee ID ${row.employeeId} already exists.`] : seen.has(key) ? [`Employee ID ${row.employeeId} appears more than once in the file.`] : []; seen.add(key); return errors; });
    setImportRows(parsed.rows); setImportErrors([...parsed.errors, ...duplicates]);
  };
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(['employeeId,firstName,lastName,department,jobTitle,email\nEMP-013,An,Nguyen,Engineering,Software Engineer,an.nguyen@company.com\n'], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'eris-employee-import-template.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  const applyBulk = () => {
    const affectedIds = matches.map(item => item.id);
    const changes = bulk.field === 'Department' ? { department: bulk.value } : bulk.field === 'Job Title' ? { role: bulk.value } : { status: bulk.value as 'Active' | 'Inactive' };
    setBulkUpdatedCount(bulkUpdate(affectedIds, changes)); setConfirm(false); setSaved(true);
  };

  if (mode === 'add') return <AppShell breadcrumb={['Workforce', 'Add Employee']}><FlowHeader title="Add Employee" description="Create the employee master record first. Account access and retention analysis can be configured after the record is validated." onBack={() => navigate('/employees')}/><Steps active={step} labels={['Basic information','Employment details','Review & create']}/><Card className="mx-auto max-w-4xl p-6">{saved ? <Success title="Employee record created" detail={`${employee.employeeId} · ${employee.firstName} ${employee.lastName}`} onDone={() => navigate('/employees')}/> : <>
    {step === 0 && <div><h2 className="font-bold text-slate-900">{t('Basic information')}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="First name"><Input value={employee.firstName} onChange={value => setEmployee({...employee,firstName:value})}/></Field><Field label="Last name"><Input value={employee.lastName} onChange={value => setEmployee({...employee,lastName:value})}/></Field><Field label="Employee ID"><Input value={employee.employeeId} onChange={value => {setEmployee({...employee,employeeId:value});setMessage('');}}/></Field><Field label="Email"><Input value={employee.email} onChange={value => setEmployee({...employee,email:value})}/></Field></div>{message && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{t(message)}</p>}</div>}
    {step === 1 && <div><h2 className="font-bold text-slate-900">{t('Employment details')}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Department"><Select value={employee.department} onChange={value => setEmployee({...employee,department:value})} options={departments} placeholder={t('Select department')} className="w-full"/></Field><Field label="Job title"><Select value={employee.jobTitle} onChange={value => setEmployee({...employee,jobTitle:value})} options={jobTitles} placeholder={t('Select job title')} className="w-full"/></Field><Field label="Supervisor"><Input value={employee.supervisor} onChange={value => setEmployee({...employee,supervisor:value})} placeholder={t('Optional')}/></Field></div></div>}
    {step === 2 && <div><h2 className="font-bold text-slate-900">{t('Review employee record')}</h2><dl className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">{[['First name',employee.firstName],['Last name',employee.lastName],['Employee ID',employee.employeeId],['Email',employee.email],['Department',employee.department],['Job title',employee.jobTitle],['Supervisor',employee.supervisor]].map(([label,value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{t(label)}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value || t('Not provided')}</dd></div>)}</dl></div>}
    <Footer step={step} back={() => setStep(step-1)} next={() => setStep(step+1)} nextDisabled={step === 0 ? !employee.firstName.trim() || !employee.lastName.trim() || !employee.employeeId.trim() : !employee.department || !employee.jobTitle} finish={createEmployee} finishLabel="Create Employee" finishIcon={<UserPlus size={16}/>}/></>}</Card></AppShell>;

  if (mode === 'import') return <AppShell breadcrumb={['Workforce','Import Employees']}><FlowHeader title="Import Employees" description="Upload employee master data using the company template. AI preparation is handled separately after HR validates these records." onBack={() => navigate('/employees')}/><Steps active={importedCount !== null ? 2 : fileName ? 1 : 0} labels={['Upload CSV','Validate records','Confirm import']}/>{importedCount !== null ? <Card className="p-6"><Success title="Employee import completed" detail={`${importedCount} employee records were added.`} onDone={() => navigate('/employees')}/></Card> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><Card className="p-6"><div className="rounded-[20px] border-2 border-dashed border-orange-200 bg-orange-50/50 p-8 text-center"><Upload size={36} className="mx-auto text-orange-500"/><h2 className="mt-4 font-bold text-slate-900">{t(fileName || 'Upload employee CSV')}</h2><p className="mt-2 text-sm text-slate-500">{t('CSV up to 10 MB. Use the template to preserve field names and formats.')}</p><label className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-orange-500 px-5 text-sm font-bold text-white"><input type="file" accept=".csv,text/csv" className="sr-only" onChange={event => void readCsv(event.target.files?.[0])}/>{t('Select CSV file')}</label></div>{fileName && <div className="mt-5"><div className="grid gap-3 sm:grid-cols-2"><Metric value={importRows.length} label="Valid records" good/><Metric value={importErrors.length} label="Errors"/></div>{importErrors.length > 0 && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-xs leading-5 text-red-800"><b className="mb-2 flex items-center gap-2"><AlertCircle size={16}/>{t('Correct these issues before importing')}</b>{importErrors.slice(0,6).map(error => <p key={error}>• {error}</p>)}</div>}<Button className="mt-5" disabled={!importRows.length || Boolean(importErrors.length)} onClick={() => setConfirm(true)}>{t('Review and confirm import')}<ArrowRight size={16}/></Button></div>}</Card><Card className="p-5"><FileSpreadsheet size={24} className="text-orange-500"/><h2 className="mt-3 font-bold text-slate-900">{t('Employee import template')}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{t('Includes the required column names and a valid example row.')}</p><Button variant="secondary" className="mt-5 w-full" onClick={downloadTemplate}><Download size={15}/>{t('Download template')}</Button></Card></div>}<ConfirmationDialog open={confirm} title="Confirm employee import" description={`${importRows.length} validated employee records will be added to the directory.`} confirmLabel="Import Employees" onCancel={() => setConfirm(false)} onConfirm={() => {const result=importEmployees(importRows);setConfirm(false);setImportedCount(result.created);}}/></AppShell>;

  return <AppShell breadcrumb={['Workforce','Bulk Update']}><FlowHeader title="Bulk Update" description="Select an employee group, define one controlled change, preview the impact, and apply it to employee master data." onBack={() => navigate('/employees')}/><Steps active={saved ? 2 : step} labels={['Select employees','Configure change','Preview & confirm']}/><Card className="mx-auto max-w-5xl p-6">{saved ? <Success title="Bulk update completed" detail={`${bulkUpdatedCount} employee records were updated.`} onDone={() => navigate('/employees')}/> : <>
    {step === 0 && <div><h2 className="font-bold text-slate-900">{t('Select employee group')}</h2><p className="mt-1 text-sm text-slate-500">{t('Choose at least one filter to prevent an accidental company-wide update.')}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Select value={bulk.department} onChange={value => setBulk({...bulk,department:value})} options={departments} placeholder={t('All departments')} className="w-full"/><Select value={bulk.jobTitle} onChange={value => setBulk({...bulk,jobTitle:value})} options={jobTitles} placeholder={t('All job titles')} className="w-full"/></div><div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-orange-800">{matches.length} {t('employees match the current criteria')}</div></div>}
    {step === 1 && <div><h2 className="font-bold text-slate-900">{t('Configure update')}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Select value={bulk.field} onChange={value => setBulk({...bulk,field:value,value:''})} options={['Department','Job Title','Employment Status']} className="w-full"/><Select value={bulk.value} onChange={value => setBulk({...bulk,value})} options={changeOptions} placeholder={t('Select new value')} className="w-full"/></div></div>}
    {step === 2 && <div><h2 className="font-bold text-slate-900">{t('Preview changes')}</h2><div className="mt-5 rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">{t('Affected employees')}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{matches.length}</p><div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">{t(bulk.field)}</span><ArrowRight size={16} className="text-orange-500"/><b>{t(bulk.value)}</b></div></div></div>}
    <Footer step={step} back={() => setStep(step-1)} next={() => setStep(step+1)} nextDisabled={step === 0 ? (!bulk.department && !bulk.jobTitle) || !matches.length : !bulk.value} finish={() => setConfirm(true)} finishLabel="Apply bulk update" finishIcon={<RefreshCw size={16}/>}/></>}</Card><ConfirmationDialog open={confirm} title="Confirm bulk update" description={`This change will update ${matches.length} employee records.`} confirmLabel="Apply Update" onCancel={() => setConfirm(false)} onConfirm={applyBulk}/></AppShell>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { const { t } = useLanguage(); return <label className="space-y-2 text-sm font-semibold text-slate-700"><span>{t(label)}</span>{children}</label>; }
function Metric({ value, label, good=false }: { value: number; label: string; good?: boolean }) { const { t } = useLanguage(); return <div className={`rounded-2xl p-4 ${good?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}><b className="text-2xl">{value}</b><p className="text-xs">{t(label)}</p></div>; }
function Success({ title, detail, onDone }: { title: string; detail: string; onDone: () => void }) { const { t } = useLanguage(); return <div className="py-12 text-center"><CheckCircle2 size={48} className="mx-auto text-emerald-500"/><h2 className="mt-4 text-xl font-bold text-slate-900">{t(title)}</h2><p className="mt-2 text-sm text-slate-500">{t(detail)}</p><Button className="mt-6" onClick={onDone}>{t('Open employee directory')}</Button></div>; }
function Footer({ step, back, next, nextDisabled, finish, finishLabel, finishIcon }: { step: number; back:()=>void; next:()=>void; nextDisabled:boolean; finish:()=>void; finishLabel:string; finishIcon:ReactNode }) { const { t } = useLanguage(); return <div className="mt-6 flex justify-between border-t border-slate-100 pt-5"><Button variant="secondary" disabled={step===0} onClick={back}>{t('Back')}</Button>{step<2?<Button disabled={nextDisabled} onClick={next}>{t('Continue')}<ArrowRight size={16}/></Button>:<Button onClick={finish}>{finishIcon}{t(finishLabel)}</Button>}</div>; }
