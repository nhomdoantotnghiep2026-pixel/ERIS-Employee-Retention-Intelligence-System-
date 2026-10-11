import { type ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RoleProvider, useRole, type UserRole } from './context/RoleContext';
import { LanguageProvider } from './context/LanguageContext';
import { EmployeeProvider } from './context/EmployeeContext';
import Login from './screens/Login';

// HR
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
import EmployeeDataManagement from './screens/EmployeeDataManagement';
import EmployeePortal from './screens/EmployeePortal';

// Data / AI Analyst
import DataOverview from './screens/DataOverview';
import EmployeeData from './screens/EmployeeData';
import ImportData from './screens/ImportData';
import DataPreparation from './screens/DataPreparation';
import DataPipelines from './screens/DataPipelines';
import SchemaMapping from './screens/SchemaMapping';
import AIModelConfig from './screens/AIModelConfig';
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
import { hasRoutePermission, RBAC_UPDATED_EVENT } from './utils/rbacAccess';

const ROLE_ACCESS: Record<UserRole, string[]> = {
  'HR': [
    '/dashboard', '/org-overview', '/org-chart', '/onboarding', '/workforce-risk',
    '/employees', '/attrition-risk', '/interventions', '/engagement',
    '/executive-reports', '/reports',
  ],
  'Data / AI Analyst': ['/data-overview', '/data', '/import', '/preparation', '/schema', '/data-pipelines', '/model', '/ai-config', '/model/eval', '/model-performance', '/feature-importance', '/model-history', '/audit-logs'],
  'System Administrator': ['/admin-overview', '/users', '/roles', '/rbac', '/system', '/activity', '/system-health'],
  'Employee / ESS': ['/employee-dashboard', '/my-profile', '/my-attendance', '/my-surveys'],
};

const ROLE_HOME: Record<UserRole, string> = {
  'HR': '/dashboard',
  'Data / AI Analyst': '/data-overview',
  'System Administrator': '/admin-overview',
  'Employee / ESS': '/employee-dashboard',
};

function RoleGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useRole();
  const { pathname } = useLocation();
  const [, setPermissionRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setPermissionRevision(value => value + 1);
    window.addEventListener(RBAC_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(RBAC_UPDATED_EVENT, refresh);
  }, []);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const allowedByRole = ROLE_ACCESS[user.role].some(route => pathname === route || pathname.startsWith(`${route}/`));
  const allowed = allowedByRole && hasRoutePermission(user.role, pathname);
  return allowed ? <>{children}</> : <Navigate to={ROLE_HOME[user.role]} replace />;
}

function RouteFallback() {
  const { user, isAuthenticated } = useRole();
  return <Navigate to={isAuthenticated ? ROLE_HOME[user.role] : '/login'} replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <RoleProvider>
        <EmployeeProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<RouteFallback />} />
          <Route path="/login" element={<Login />} />

          {/* HR */}
          <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
          <Route path="/org-overview" element={<RoleGuard><OrgOverview /></RoleGuard>} />
          <Route path="/org-chart" element={<RoleGuard><OrgChart /></RoleGuard>} />
          <Route path="/onboarding" element={<RoleGuard><Onboarding /></RoleGuard>} />
          <Route path="/workforce-risk" element={<RoleGuard><Navigate to="/org-overview" replace /></RoleGuard>} />
          <Route path="/attrition-risk" element={<RoleGuard><AttritionRisk /></RoleGuard>} />
          <Route path="/interventions" element={<RoleGuard><RetentionInterventions /></RoleGuard>} />
          <Route path="/engagement" element={<RoleGuard><EngagementSurveys /></RoleGuard>} />
          <Route path="/executive-reports" element={<RoleGuard><ExecutiveReports /></RoleGuard>} />

          {/* Shared HR */}
          <Route path="/employees" element={<RoleGuard><Employees /></RoleGuard>} />
          <Route path="/employees/new" element={<RoleGuard><EmployeeDataManagement mode="add" /></RoleGuard>} />
          <Route path="/employees/import" element={<RoleGuard><EmployeeDataManagement mode="import" /></RoleGuard>} />
          <Route path="/employees/bulk-update" element={<RoleGuard><EmployeeDataManagement mode="bulk" /></RoleGuard>} />
          <Route path="/employees/:id" element={<RoleGuard><EmployeeProfile /></RoleGuard>} />
          <Route path="/employees/:id/risk" element={<RoleGuard><RiskAnalysis /></RoleGuard>} />
          <Route path="/reports" element={<RoleGuard><Reports /></RoleGuard>} />
          <Route path="/reports/:reportId" element={<RoleGuard><ReportDetail /></RoleGuard>} />

          {/* Employee self service */}
          <Route path="/employee-dashboard" element={<RoleGuard><EmployeePortal mode="dashboard" /></RoleGuard>} />
          <Route path="/my-profile" element={<RoleGuard><EmployeePortal mode="profile" /></RoleGuard>} />
          <Route path="/my-attendance" element={<RoleGuard><EmployeePortal mode="attendance" /></RoleGuard>} />
          <Route path="/my-surveys" element={<RoleGuard><EmployeePortal mode="surveys" /></RoleGuard>} />

          {/* Data / AI Analyst */}
          <Route path="/data-overview" element={<RoleGuard><DataOverview /></RoleGuard>} />
          <Route path="/data" element={<RoleGuard><EmployeeData /></RoleGuard>} />
          <Route path="/import" element={<RoleGuard><ImportData /></RoleGuard>} />
          <Route path="/preparation" element={<RoleGuard><DataPreparation /></RoleGuard>} />
          <Route path="/data-pipelines" element={<RoleGuard><DataPipelines /></RoleGuard>} />
          <Route path="/schema" element={<RoleGuard><SchemaMapping /></RoleGuard>} />
          <Route path="/model" element={<RoleGuard><Navigate to="/model-performance" replace /></RoleGuard>} />
          <Route path="/ai-config" element={<RoleGuard><AIModelConfig /></RoleGuard>} />
          <Route path="/model/eval" element={<RoleGuard><Navigate to="/model-performance" replace /></RoleGuard>} />
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
          <Route path="*" element={<RouteFallback />} />
          </Routes>
        </BrowserRouter>
        </EmployeeProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}
