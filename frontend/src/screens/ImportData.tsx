import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card, Button, SectionHeader } from '../components/ui';
import { Upload, ChevronRight, CheckCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';

const steps = ['Upload File', 'Column Mapping', 'Validation Preview'];

const columnMappings = [
  { source: 'EmployeeNumber', target: 'Employee ID', ok: true },
  { source: 'Department', target: 'Department', ok: true },
  { source: 'JobRole', target: 'Job Role', ok: true },
  { source: 'MonthlyIncome', target: 'Monthly Income', ok: true },
  { source: 'OverTime', target: 'Overtime', ok: true },
  { source: 'YearsAtCompany', target: 'Tenure (Years)', ok: true },
  { source: 'JobSatisfaction', target: 'Job Satisfaction', ok: true },
  { source: 'Age', target: 'Age', ok: true },
  { source: 'WorkLifeBalance', target: 'Work-Life Balance', ok: true },
  { source: 'BusinessTravel', target: 'Business Travel', ok: true },
  { source: 'EmpCode', target: '', ok: false },
];

export default function ImportData() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  return (
    <AppShell breadcrumb={['Employee Data', 'Import Data']}>
      <SectionHeader title="Import Employee Data" description="Upload employee data for attrition analysis." />

      {/* Steps */}
      <div className="flex items-center gap-1 mb-5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-2 px-3 h-[32px] text-[13px] font-medium cursor-pointer transition-colors ${
                i === step ? 'bg-[#2563EB] text-white' : i < step ? 'bg-blue-50 text-[#2563EB] border border-blue-200' : 'bg-gray-100 text-gray-400'
              }`}
              style={{ borderRadius: '5px' }}
              onClick={() => i <= step && setStep(i)}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-bold ${i === step ? 'bg-white/20' : ''}`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card className="p-5 max-w-xl">
          <div
            className={`border-2 border-dashed p-10 text-center transition-colors ${dragOver ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            style={{ borderRadius: '5px' }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); setFileSelected(true); }}
          >
            {fileSelected ? (
              <>
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <div className="text-[14px] font-medium text-gray-800 mb-0.5">employees_2026_q3.csv</div>
                <div className="text-[13px] text-gray-400">1,248 rows · 2.4 MB</div>
              </>
            ) : (
              <>
                <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                <div className="text-[14px] font-medium text-gray-700 mb-1">Drag and drop your file here</div>
                <div className="text-[13px] text-gray-400 mb-3">CSV or XLSX · Max 50MB</div>
                <label className="inline-block px-3 h-[32px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium cursor-pointer transition-colors flex items-center" style={{ borderRadius: '5px' }}>
                  Choose File
                  <input type="file" className="hidden" onChange={() => setFileSelected(true)} />
                </label>
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate('/data')}>Cancel</Button>
            <Button variant="primary" disabled={!fileSelected} onClick={() => setStep(1)}>Continue <ChevronRight size={13} /></Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="max-w-xl">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-[14px] font-medium text-gray-800">Column Mapping</div>
            <div className="text-[12px] text-gray-400">Map your file columns to ERIS fields</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="text-[12px] font-medium text-gray-400 uppercase">Source Column</div>
              <div className="text-[12px] font-medium text-gray-400 uppercase">ERIS Field</div>
              <div className="text-[12px] font-medium text-gray-400 uppercase">Status</div>
            </div>
            <div className="space-y-1">
              {columnMappings.map(m => (
                <div key={m.source} className={`grid grid-cols-3 gap-3 items-center px-2 py-1.5 ${!m.ok ? 'bg-amber-50' : 'hover:bg-gray-50'}`} style={{ borderRadius: '4px' }}>
                  <span className="font-mono text-[12px] text-gray-700">{m.source}</span>
                  <select className={`h-[28px] text-[12px] border px-2 focus:outline-none focus:ring-1 focus:ring-[#2563EB] ${!m.ok ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`} style={{ borderRadius: '4px' }}>
                    <option>{m.target || '— Select field —'}</option>
                  </select>
                  <span className={`text-[12px] font-medium ${m.ok ? 'text-green-600' : 'text-amber-600'}`}>
                    {m.ok ? '✓ Mapped' : '⚠ Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(0)}><ArrowLeft size={13} /> Back</Button>
            <Button variant="primary" onClick={() => setStep(2)}>Continue <ChevronRight size={13} /></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-xl p-5">
          <div className="text-[14px] font-medium text-gray-800 mb-3">Validation Preview</div>
          <div className="flex items-center gap-3 mb-4">
            {[
              { label: 'Total', value: '1,248', color: 'text-gray-900' },
              { label: 'Valid', value: '1,186', color: 'text-green-600' },
              { label: 'Warnings', value: '48', color: 'text-amber-600' },
              { label: 'Invalid', value: '14', color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center px-3 py-2.5 bg-gray-50 border border-gray-200" style={{ borderRadius: '5px' }}>
                <div className={`text-[20px] font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="text-[12px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sample Issues</div>
            <div className="space-y-1.5">
              {[
                { row: 3, field: 'Job Satisfaction', issue: 'Missing value', sev: 'Warning' },
                { row: 5, field: 'Monthly Income', issue: 'Value out of range', sev: 'Warning' },
                { row: 6, field: 'Department', issue: 'Unknown code "MKT2"', sev: 'Error' },
              ].map(i => (
                <div key={i.row} className={`flex items-center gap-2 px-2.5 py-1.5 text-[12px] ${i.sev === 'Error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`} style={{ borderRadius: '4px' }}>
                  {i.sev === 'Error' ? <XCircle size={12} /> : <AlertTriangle size={12} />}
                  Row {i.row}: <strong>{i.field}</strong> — {i.issue}
                </div>
              ))}
            </div>
          </div>
          <div className="px-3 py-2 mb-4 bg-blue-50 border border-blue-100 text-[12px] text-blue-700" style={{ borderRadius: '5px' }}>
            After import, validate and prepare data before running attrition analysis.
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}><ArrowLeft size={13} /> Back</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/data')}>Cancel</Button>
              <Button variant="primary" onClick={() => navigate('/data')}><Upload size={13} /> Import Valid Records</Button>
            </div>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
