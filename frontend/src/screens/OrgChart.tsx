import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, RiskBadge, Button } from '../components/ui';
import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { demoPdfContent, downloadTextFile } from '../utils/demoActions';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  dept: string;
  initials: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  headcount?: number;
  children?: OrgNode[];
  expanded?: boolean;
}

const orgTree: OrgNode = {
  id: 'ceo',
  name: 'Nguyen Minh CEO',
  title: 'Chief Executive Officer',
  dept: 'Executive',
  initials: 'NC',
  riskLevel: 'Low',
  children: [
    {
      id: 'eng-head',
      name: 'Hoang Van CTO',
      title: 'Chief Technology Officer',
      dept: 'Engineering',
      initials: 'HC',
      riskLevel: 'Low',
      headcount: 287,
      children: [
        { id: 'eng1', name: 'Nguyen Van A', title: 'Software Engineer', dept: 'Engineering', initials: 'NA', riskLevel: 'High' },
        { id: 'eng2', name: 'Hoang Van E', title: 'Senior Engineer', dept: 'Engineering', initials: 'HE', riskLevel: 'Medium' },
        { id: 'eng3', name: 'Bui Thi I', title: 'DevOps Engineer', dept: 'Engineering', initials: 'BI', riskLevel: 'High' },
      ],
    },
    {
      id: 'sales-head',
      name: 'Dang Van H',
      title: 'VP of Sales',
      dept: 'Sales',
      initials: 'DH',
      riskLevel: 'Medium',
      headcount: 195,
      children: [
        { id: 'sales1', name: 'Tran Thi B', title: 'Sales Representative', dept: 'Sales', initials: 'TB', riskLevel: 'High' },
      ],
    },
    {
      id: 'fin-head',
      name: 'Pham Thi CFO',
      title: 'Chief Financial Officer',
      dept: 'Finance',
      initials: 'PC',
      riskLevel: 'Low',
      headcount: 112,
      children: [
        { id: 'fin1', name: 'Pham Thi D', title: 'Financial Analyst', dept: 'Finance', initials: 'PD', riskLevel: 'Low' },
        { id: 'fin2', name: 'Tran Van K', title: 'Senior Accountant', dept: 'Finance', initials: 'TK', riskLevel: 'Medium' },
      ],
    },
    {
      id: 'hr-head',
      name: 'Le Thi CHRO',
      title: 'Chief HR Officer',
      dept: 'Human Resources',
      initials: 'LC',
      riskLevel: 'Low',
      headcount: 52,
      children: [
        { id: 'hr1', name: 'Vo Thi G', title: 'HR Coordinator', dept: 'Human Resources', initials: 'VG', riskLevel: 'Low' },
      ],
    },
  ],
};

const avatarColors: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
};

const departments = orgTree.children ?? [];
const totalHeadcount = departments.reduce((sum, dept) => sum + (dept.headcount ?? 0), 0);
const totalHighRisk = departments.reduce((sum, dept) => sum + (dept.children?.filter(child => child.riskLevel === 'High').length ?? 0), 0);
const departmentSummary = departments.map(dept => {
  const highRisk = dept.children?.filter(child => child.riskLevel === 'High').length ?? 0;
  const mediumRisk = dept.children?.filter(child => child.riskLevel === 'Medium').length ?? 0;
  const visibleTeam = dept.children?.length ?? 0;
  return { ...dept, highRisk, mediumRisk, visibleTeam };
});

function OrgCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`${depth > 0 ? 'pl-6 border-l border-slate-200' : ''}`}>
      <div className="flex items-start gap-2 mb-2">
        {hasChildren && (
          <button onClick={() => setExpanded(!expanded)} className="mt-2 text-slate-400 hover:text-slate-600 flex-shrink-0">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="w-[14px] flex-shrink-0" />}
        <div className="flex min-w-[300px] max-w-[520px] flex-1 items-center gap-2.5 rounded-[6px] border border-slate-200 bg-white px-3 py-2 transition-all hover:border-indigo-200 hover:shadow-sm">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[node.riskLevel]}`}>
            {node.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-slate-800">{node.name}</div>
            <div className="text-[11px] text-slate-400">{node.title}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {node.headcount && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Users size={11} /> {node.headcount}
              </div>
            )}
            <RiskBadge level={node.riskLevel} />
          </div>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 space-y-1">
          {node.children!.map(child => (
            <OrgCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  return (
    <AppShell breadcrumb={['Workforce', 'Org Chart']}>
      <SectionHeader title="Org Chart" description="Interactive organizational hierarchy with risk indicators">
        <Button variant="secondary" size="sm" onClick={() => downloadTextFile('org-chart.pdf', demoPdfContent('Org Chart', 'Organizational hierarchy with risk indicators exported from ERIS demo workspace.'))}>Export PDF</Button>
      </SectionHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-x-auto p-5">
          <div className="min-w-[620px]">
            <OrgCard node={orgTree} depth={0} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-[14px] font-semibold text-slate-800">Organization Summary</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Departments</div>
                <div className="mt-1 text-[24px] font-semibold leading-none text-slate-900">{departments.length}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Headcount</div>
                <div className="mt-1 text-[24px] font-semibold leading-none text-slate-900">{totalHeadcount}</div>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-500"><AlertTriangle size={12} /> High Risk</div>
                <div className="mt-1 text-[24px] font-semibold leading-none text-red-600">{totalHighRisk}</div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-600"><TrendingUp size={12} /> Watchlist</div>
                <div className="mt-1 text-[24px] font-semibold leading-none text-amber-600">3</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-[14px] font-semibold text-slate-800">Department Risk Focus</div>
            <div className="space-y-2">
              {departmentSummary.map(dept => (
                <div key={dept.id} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-slate-800">{dept.dept}</div>
                      <div className="text-[11px] text-slate-400">{dept.visibleTeam} visible employees · {dept.headcount} total</div>
                    </div>
                    <RiskBadge level={dept.riskLevel} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded bg-red-50 px-2 py-1 text-red-600">{dept.highRisk} high risk</div>
                    <div className="rounded bg-amber-50 px-2 py-1 text-amber-600">{dept.mediumRisk} medium risk</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
