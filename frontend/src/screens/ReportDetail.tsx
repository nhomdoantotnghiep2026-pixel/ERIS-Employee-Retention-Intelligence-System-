import { AppShell } from '../components/AppShell';
import { Card, Button, RiskBadge, Avatar, AIAdvisoryBanner } from '../components/ui';
import { employees, departments } from '../data/mockData';
import { Download, Printer, FileDown } from 'lucide-react';
import { demoPdfContent, downloadTextFile, toCsv } from '../utils/demoActions';

export default function ReportDetail() {
  const highRisk = employees.filter(e => e.riskLevel === 'High');
  const exportCsv = () => downloadTextFile('workforce-attrition-risk-report.csv', toCsv(highRisk.map(emp => ({
    employeeId: emp.employeeId,
    name: emp.name,
    department: emp.department,
    role: emp.role,
    riskLevel: emp.riskLevel,
    riskScore: emp.riskScore,
  }))), 'text/csv;charset=utf-8');
  const downloadPdf = () => downloadTextFile('workforce-attrition-risk-report.pdf', demoPdfContent('Workforce Attrition Risk Report', 'Executive summary, department comparison, high-risk employees, and analysis method exported from ERIS demo workspace.'));

  return (
    <AppShell breadcrumb={['Reports', 'Workforce Attrition Risk Report']}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Workforce Attrition Risk Report</h1>
          <div className="flex items-center gap-3 mt-0.5 text-[13px] text-gray-500">
            <span>Generated: Sep 22, 2026</span>
            <span>·</span><span>All Departments</span>
            <span>·</span><span>Current Workforce</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer size={13} /> Print</Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}><FileDown size={13} /> Export CSV</Button>
          <Button variant="primary" size="sm" onClick={downloadPdf}><Download size={13} /> Download PDF</Button>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold text-gray-800 mb-2">Executive Summary</div>
        <p className="text-[13px] text-gray-600 leading-relaxed">
          This report provides an overview of predicted employee attrition risk as of September 2026. Based on AI-assisted analysis, 10.1% of employees (126 individuals) are currently identified as high predicted attrition risk, with Engineering and Sales departments showing the highest concentration. Overtime and low job satisfaction are the most prevalent contributing factors.
        </p>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
          This report informs HR planning and retention initiatives. All information represents model predictions and should be reviewed by qualified HR personnel before informing any employment-related decisions.
        </p>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold text-gray-800 mb-3">Risk Distribution</div>
        <div className="flex items-center gap-4 mb-3">
          {[
            { label: 'High Risk', count: 126, pct: '10.1%', color: 'text-red-600' },
            { label: 'Medium Risk', count: 312, pct: '25.0%', color: 'text-amber-600' },
            { label: 'Low Risk', count: 810, pct: '64.9%', color: 'text-green-600' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-200" style={{ borderRadius: '5px' }}>
              <span className={`text-[22px] font-bold ${r.color}`}>{r.count}</span>
              <div>
                <div className="text-[13px] text-gray-600">{r.label}</div>
                <div className={`text-[12px] font-medium ${r.color}`}>{r.pct}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex h-2 rounded overflow-hidden">
          <div className="bg-red-500" style={{ width: '10.1%' }} />
          <div className="bg-amber-500" style={{ width: '25%' }} />
          <div className="bg-green-500" style={{ width: '64.9%' }} />
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold text-gray-800 mb-3">Department Comparison</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {['Department', 'Total', 'High Risk', 'High Risk %', 'Avg Score'].map(h => (
                <th key={h} className="pb-2 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map(d => (
              <tr key={d.name}>
                <td className="py-2 text-[13px] font-medium text-gray-800">{d.name}</td>
                <td className="py-2 text-[13px] text-gray-600">{d.employees}</td>
                <td className="py-2 text-[13px] font-semibold text-red-600">{d.highRisk}</td>
                <td className="py-2 text-[13px] text-gray-600">{Math.round(d.highRisk / d.employees * 100)}%</td>
                <td className="py-2 text-[13px] text-gray-600">{d.avgRisk}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold text-gray-800 mb-3">Employees Requiring Review</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Employee', 'Department', 'Role', 'Risk Level', 'Score'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {highRisk.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/60">
                <td className="px-3 h-[40px]">
                  <div className="flex items-center gap-2">
                    <Avatar initials={emp.initials} size="xs" />
                    <span className="text-[13px] font-medium text-gray-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-3 h-[40px] text-[13px] text-gray-600">{emp.department}</td>
                <td className="px-3 h-[40px] text-[13px] text-gray-600">{emp.role}</td>
                <td className="px-3 h-[40px]"><RiskBadge level={emp.riskLevel} /></td>
                <td className="px-3 h-[40px] text-[13px] font-semibold text-red-600">{emp.riskScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4 mb-4">
        <div className="text-[14px] font-semibold text-gray-800 mb-2">Analysis Method</div>
        <p className="text-[13px] text-gray-600 leading-relaxed">
          Attrition risk predictions were generated using the ERIS Employee Attrition Prediction Model (v2.3), a supervised machine learning model trained on historical workforce data. Model evaluation: Accuracy 87.2%, F1 Score 84.1%, ROC-AUC 0.921.
        </p>
        <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">
          Contributing factor analysis estimates which workforce characteristics are most strongly associated with elevated risk predictions. These associations are not causal claims.
        </p>
      </Card>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
