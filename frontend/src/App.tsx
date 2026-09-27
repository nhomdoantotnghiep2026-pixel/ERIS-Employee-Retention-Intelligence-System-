import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RoleProvider, useRole, type UserRole } from './context/RoleContext';
import Login from './screens/Login';

// HR Staff
import StaffOverview from './screens/StaffOverview';
import StaffRiskAnalysis from './screens/StaffRiskAnalysis';
import StaffDashboard from './screens/StaffDashboard';
import StaffRiskMonitor from './screens/StaffRiskMonitor';
import RetentionTasks from './screens/RetentionTasks';
import PulseSurveys from './screens/PulseSurveys';
import ExportReports from './screens/ExportReports';

// HR Manager
import Dashboard from './screens/Dashboard';
import OrgOverview from './screens/OrgOverview';
import OrgChart from './screens/OrgChart';
import Onboarding from './screens/Onboarding';
import AttritionRisk from './screens/AttritionRisk';
import RetentionInterventions from './screens/RetentionInterventions';
import EngagementSurveys from './screens/EngagementSurveys';
import ExecutiveReports from './screens/ExecutiveReports';

// Shared HR screens
import Employees from './screens/Employees';
import EmployeeProfile from './screens/EmployeeProfile';
import RiskAnalysis from './screens/RiskAnalysis';
import Reports from './screens/Reports';
import ReportDetail from './screens/ReportDetail';

// Data / AI Analyst
import DataOverview from './screens/DataOverview';
import EmployeeData from './screens/EmployeeData';
import ImportData from './screens/ImportData';
import DataPreparation from './screens/DataPreparation';
import DataPipelines from './screens/DataPipelines';
import SchemaMapping from './screens/SchemaMapping';
import AIModel from './screens/AIModel';
import AIModelConfig from './screens/AIModelConfig';
import ModelEvaluation from './screens/ModelEvaluation';
import ModelPerformance from './screens/ModelPerformance';
import FeatureImportance from './screens/FeatureImportance';
import ModelHistory from './screens/ModelHistory';
import AuditLogs from './screens/AuditLogs';

// System Administrator
import AdminOverview from './screens/AdminOverview';
import Users from './screens/Users';
import Roles from './screens/Roles';
import SystemConfig from './screens/SystemConfig';
import SystemActivity from './screens/SystemActivity';
import SystemHealth from './screens/SystemHealth';

const ROLE_ACCESS: Record<UserRole, string[]> = {
  'HR Staff': ['/staff-dashboard', '/employees', '/overview', '/staff-risk', '/staff-risk-monitor', '/retention-tasks', '/pulse-surveys', '/export-reports'],
  'HR Manager': [
    '/dashboard', '/org-overview', '/org-chart', '/onboarding', '/workforce-risk',
    '/employees', '/attrition-risk', '/interventions', '/engagement',
    '/executive-reports', '/reports',
  ],
  'Data / AI Analyst': ['/data-overview', '/data', '/import', '/preparation', '/schema', '/data-pipelines', '/model', '/ai-config', '/model/eval', '/model-performance', '/feature-importance', '/model-history', '/audit-logs'],
  'System Administrator': ['/admin-overview', '/users', '/roles', '/rbac', '/system', '/activity', '/system-health'],
};

const ROLE_HOME: Record<UserRole, string> = {
  'HR Staff': '/staff-dashboard',
  'HR Manager': '/dashboard',
  'Data / AI Analyst': '/data-overview',
  'System Administrator': '/admin-overview',
};

function RoleGuard({ children }: { children: ReactNode }) {
  const { user } = useRole();
  const { pathname } = useLocation();
  const allowed = ROLE_ACCESS[user.role].some(route => pathname === route || pathname.startsWith(`${route}/`));
  return allowed ? <>{children}</> : <Navigate to={ROLE_HOME[user.role]} replace />;
}

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* HR Staff */}
          <Route path="/staff-dashboard" element={<RoleGuard><StaffDashboard /></RoleGuard>} />
          <Route path="/staff-risk-monitor" element={<RoleGuard><StaffRiskMonitor /></RoleGuard>} />
          <Route path="/retention-tasks" element={<RoleGuard><RetentionTasks /></RoleGuard>} />
          <Route path="/pulse-surveys" element={<RoleGuard><PulseSurveys /></RoleGuard>} />
          <Route path="/export-reports" element={<RoleGuard><ExportReports /></RoleGuard>} />
          <Route path="/overview" element={<RoleGuard><StaffOverview /></RoleGuard>} />
          <Route path="/staff-risk" element={<RoleGuard><StaffRiskAnalysis /></RoleGuard>} />

          {/* HR Manager */}
          <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
          <Route path="/org-overview" element={<RoleGuard><OrgOverview /></RoleGuard>} />
          <Route path="/org-chart" element={<RoleGuard><OrgChart /></RoleGuard>} />
          <Route path="/onboarding" element={<RoleGuard><Onboarding /></RoleGuard>} />
          <Route path="/workforce-risk" element={<RoleGuard><OrgOverview /></RoleGuard>} />
          <Route path="/attrition-risk" element={<RoleGuard><AttritionRisk /></RoleGuard>} />
          <Route path="/interventions" element={<RoleGuard><RetentionInterventions /></RoleGuard>} />
          <Route path="/engagement" element={<RoleGuard><EngagementSurveys /></RoleGuard>} />
          <Route path="/executive-reports" element={<RoleGuard><ExecutiveReports /></RoleGuard>} />

          {/* Shared HR */}
          <Route path="/employees" element={<RoleGuard><Employees /></RoleGuard>} />
          <Route path="/employees/:id" element={<RoleGuard><EmployeeProfile /></RoleGuard>} />
          <Route path="/employees/:id/risk" element={<RoleGuard><RiskAnalysis /></RoleGuard>} />
          <Route path="/reports" element={<RoleGuard><Reports /></RoleGuard>} />
          <Route path="/reports/detail" element={<RoleGuard><ReportDetail /></RoleGuard>} />

          {/* Data / AI Analyst */}
          <Route path="/data-overview" element={<RoleGuard><DataOverview /></RoleGuard>} />
          <Route path="/data" element={<RoleGuard><EmployeeData /></RoleGuard>} />
          <Route path="/import" element={<RoleGuard><ImportData /></RoleGuard>} />
          <Route path="/preparation" element={<RoleGuard><DataPreparation /></RoleGuard>} />
          <Route path="/data-pipelines" element={<RoleGuard><DataPipelines /></RoleGuard>} />
          <Route path="/schema" element={<RoleGuard><SchemaMapping /></RoleGuard>} />
          <Route path="/model" element={<RoleGuard><AIModel /></RoleGuard>} />
          <Route path="/ai-config" element={<RoleGuard><AIModelConfig /></RoleGuard>} />
          <Route path="/model/eval" element={<RoleGuard><ModelEvaluation /></RoleGuard>} />
          <Route path="/model-performance" element={<RoleGuard><ModelPerformance /></RoleGuard>} />
          <Route path="/feature-importance" element={<RoleGuard><FeatureImportance /></RoleGuard>} />
          <Route path="/model-history" element={<RoleGuard><ModelHistory /></RoleGuard>} />
          <Route path="/audit-logs" element={<RoleGuard><AuditLogs /></RoleGuard>} />

          {/* System Administrator */}
          <Route path="/admin-overview" element={<RoleGuard><AdminOverview /></RoleGuard>} />
          <Route path="/users" element={<RoleGuard><Users /></RoleGuard>} />
          <Route path="/roles" element={<RoleGuard><Roles /></RoleGuard>} />
          <Route path="/rbac" element={<RoleGuard><Navigate to="/roles?tab=matrix" replace /></RoleGuard>} />
          <Route path="/system" element={<RoleGuard><SystemConfig /></RoleGuard>} />
          <Route path="/activity" element={<RoleGuard><SystemActivity /></RoleGuard>} />
          <Route path="/system-health" element={<RoleGuard><SystemHealth /></RoleGuard>} />

          {/* Catch-all: redirect to role home */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
