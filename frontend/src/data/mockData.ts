export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Employee {
  id: string;
  name: string;
  initials: string;
  department: string;
  role: string;
  tenure: number;
  jobSatisfaction: number;
  riskLevel: RiskLevel;
  riskScore: number;
  lastAnalysis: string;
  age: number;
  businessTravel: string;
  overtime: boolean;
  monthlyIncome: number;
  jobLevel: number;
  environmentSatisfaction: number;
  workLifeBalance: number;
  email: string;
  employeeId: string;
  status: 'Active' | 'Inactive';
}

export const employees: Employee[] = [
  { id: '1', name: 'Nguyen Van A', initials: 'NA', department: 'Engineering', role: 'Software Engineer', tenure: 2.4, jobSatisfaction: 2, riskLevel: 'High', riskScore: 78, lastAnalysis: 'Sep 22, 2026', age: 28, businessTravel: 'Rarely', overtime: true, monthlyIncome: 5800, jobLevel: 2, environmentSatisfaction: 3, workLifeBalance: 2, email: 'nguyen.vana@company.com', employeeId: 'EMP-001', status: 'Active' },
  { id: '2', name: 'Tran Thi B', initials: 'TB', department: 'Sales', role: 'Sales Representative', tenure: 1.2, jobSatisfaction: 2, riskLevel: 'High', riskScore: 82, lastAnalysis: 'Sep 21, 2026', age: 25, businessTravel: 'Frequently', overtime: true, monthlyIncome: 3200, jobLevel: 1, environmentSatisfaction: 2, workLifeBalance: 2, email: 'tran.thib@company.com', employeeId: 'EMP-002', status: 'Active' },
  { id: '3', name: 'Le Van C', initials: 'LC', department: 'Operations', role: 'Operations Analyst', tenure: 4.1, jobSatisfaction: 3, riskLevel: 'Medium', riskScore: 54, lastAnalysis: 'Sep 20, 2026', age: 32, businessTravel: 'Never', overtime: false, monthlyIncome: 4500, jobLevel: 2, environmentSatisfaction: 3, workLifeBalance: 3, email: 'le.vanc@company.com', employeeId: 'EMP-003', status: 'Active' },
  { id: '4', name: 'Pham Thi D', initials: 'PD', department: 'Finance', role: 'Financial Analyst', tenure: 6.3, jobSatisfaction: 4, riskLevel: 'Low', riskScore: 18, lastAnalysis: 'Sep 19, 2026', age: 35, businessTravel: 'Rarely', overtime: false, monthlyIncome: 6200, jobLevel: 3, environmentSatisfaction: 4, workLifeBalance: 4, email: 'pham.thid@company.com', employeeId: 'EMP-004', status: 'Active' },
  { id: '5', name: 'Hoang Van E', initials: 'HE', department: 'Engineering', role: 'Senior Engineer', tenure: 3.7, jobSatisfaction: 3, riskLevel: 'Medium', riskScore: 47, lastAnalysis: 'Sep 22, 2026', age: 30, businessTravel: 'Never', overtime: true, monthlyIncome: 7400, jobLevel: 3, environmentSatisfaction: 3, workLifeBalance: 3, email: 'hoang.vane@company.com', employeeId: 'EMP-005', status: 'Active' },
  { id: '6', name: 'Nguyen Thi F', initials: 'NF', department: 'Marketing', role: 'Marketing Specialist', tenure: 1.8, jobSatisfaction: 2, riskLevel: 'High', riskScore: 71, lastAnalysis: 'Sep 18, 2026', age: 27, businessTravel: 'Frequently', overtime: true, monthlyIncome: 3800, jobLevel: 1, environmentSatisfaction: 2, workLifeBalance: 2, email: 'nguyen.thif@company.com', employeeId: 'EMP-006', status: 'Active' },
  { id: '7', name: 'Vo Thi G', initials: 'VG', department: 'Human Resources', role: 'HR Coordinator', tenure: 5.2, jobSatisfaction: 4, riskLevel: 'Low', riskScore: 22, lastAnalysis: 'Sep 17, 2026', age: 33, businessTravel: 'Never', overtime: false, monthlyIncome: 4100, jobLevel: 2, environmentSatisfaction: 4, workLifeBalance: 4, email: 'vo.thig@company.com', employeeId: 'EMP-007', status: 'Active' },
  { id: '8', name: 'Dang Van H', initials: 'DH', department: 'Sales', role: 'Sales Manager', tenure: 7.1, jobSatisfaction: 3, riskLevel: 'Medium', riskScore: 39, lastAnalysis: 'Sep 16, 2026', age: 38, businessTravel: 'Frequently', overtime: false, monthlyIncome: 8500, jobLevel: 4, environmentSatisfaction: 3, workLifeBalance: 3, email: 'dang.vanh@company.com', employeeId: 'EMP-008', status: 'Active' },
  { id: '9', name: 'Bui Thi I', initials: 'BI', department: 'Engineering', role: 'DevOps Engineer', tenure: 2.1, jobSatisfaction: 2, riskLevel: 'High', riskScore: 69, lastAnalysis: 'Sep 22, 2026', age: 29, businessTravel: 'Never', overtime: true, monthlyIncome: 6100, jobLevel: 2, environmentSatisfaction: 2, workLifeBalance: 2, email: 'bui.thii@company.com', employeeId: 'EMP-009', status: 'Active' },
  { id: '10', name: 'Ly Van J', initials: 'LJ', department: 'Operations', role: 'Supply Chain Analyst', tenure: 8.4, jobSatisfaction: 4, riskLevel: 'Low', riskScore: 11, lastAnalysis: 'Sep 15, 2026', age: 40, businessTravel: 'Rarely', overtime: false, monthlyIncome: 5400, jobLevel: 3, environmentSatisfaction: 4, workLifeBalance: 4, email: 'ly.vanj@company.com', employeeId: 'EMP-010', status: 'Active' },
  { id: '11', name: 'Tran Van K', initials: 'TK', department: 'Finance', role: 'Senior Accountant', tenure: 4.6, jobSatisfaction: 3, riskLevel: 'Medium', riskScore: 44, lastAnalysis: 'Sep 14, 2026', age: 36, businessTravel: 'Never', overtime: false, monthlyIncome: 5900, jobLevel: 3, environmentSatisfaction: 3, workLifeBalance: 3, email: 'tran.vank@company.com', employeeId: 'EMP-011', status: 'Active' },
  { id: '12', name: 'Do Thi L', initials: 'DL', department: 'Marketing', role: 'Content Strategist', tenure: 3.2, jobSatisfaction: 3, riskLevel: 'Medium', riskScore: 51, lastAnalysis: 'Sep 13, 2026', age: 31, businessTravel: 'Rarely', overtime: true, monthlyIncome: 4200, jobLevel: 2, environmentSatisfaction: 3, workLifeBalance: 2, email: 'do.thil@company.com', employeeId: 'EMP-012', status: 'Active' },
];

export const departments = [
  { name: 'Engineering', employees: 287, highRisk: 42, avgRisk: 48, trend: 'up' },
  { name: 'Sales', employees: 195, highRisk: 38, avgRisk: 52, trend: 'up' },
  { name: 'Operations', employees: 176, highRisk: 18, avgRisk: 32, trend: 'down' },
  { name: 'Finance', employees: 112, highRisk: 9, avgRisk: 24, trend: 'stable' },
  { name: 'Marketing', employees: 98, highRisk: 14, avgRisk: 41, trend: 'up' },
  { name: 'Human Resources', employees: 52, highRisk: 5, avgRisk: 22, trend: 'down' },
];

export const riskTrendData = [
  { month: 'Apr', high: 9.2, medium: 23.1, low: 67.7 },
  { month: 'May', high: 9.5, medium: 23.8, low: 66.7 },
  { month: 'Jun', high: 9.8, medium: 24.2, low: 66.0 },
  { month: 'Jul', high: 10.0, medium: 24.5, low: 65.5 },
  { month: 'Aug', high: 10.2, medium: 24.8, low: 65.0 },
  { month: 'Sep', high: 10.1, medium: 25.0, low: 64.9 },
];

export const contributingFactors = [
  { factor: 'Overtime', value: 18, direction: 'increase' },
  { factor: 'Low Job Satisfaction', value: 14, direction: 'increase' },
  { factor: 'Years at Company', value: 11, direction: 'increase' },
  { factor: 'Monthly Income', value: 9, direction: 'increase' },
  { factor: 'Business Travel', value: 7, direction: 'increase' },
  { factor: 'Job Involvement', value: 6, direction: 'decrease' },
  { factor: 'Work-Life Balance', value: 4, direction: 'decrease' },
];

export const orgFactors = [
  { factor: 'Overtime', pct: 68 },
  { factor: 'Job Satisfaction', pct: 61 },
  { factor: 'Years at Company', pct: 54 },
  { factor: 'Environment Satisfaction', pct: 48 },
  { factor: 'Monthly Income', pct: 44 },
];

export const users = [
  { id: '1', name: 'Admin System', email: 'admin@eris.com', role: 'System Administrator', status: 'Active', lastLogin: 'Sep 22, 2026', created: 'Jan 15, 2025' },
  { id: '2', name: 'Le Thi Manager', email: 'manager@eris.com', role: 'HR Manager', status: 'Active', lastLogin: 'Sep 22, 2026', created: 'Feb 3, 2025' },
  { id: '3', name: 'Pham Van Staff', email: 'staff@eris.com', role: 'HR Staff', status: 'Active', lastLogin: 'Sep 21, 2026', created: 'Mar 10, 2025' },
  { id: '4', name: 'Nguyen Data', email: 'analyst@eris.com', role: 'Data / AI Analyst', status: 'Active', lastLogin: 'Sep 20, 2026', created: 'Apr 5, 2025' },
  { id: '5', name: 'Tran Van Inactive', email: 'inactive@eris.com', role: 'HR Staff', status: 'Inactive', lastLogin: 'Jul 10, 2026', created: 'Jun 1, 2025' },
];

export const activityLog = [
  { time: '09:42 AM', user: 'Le Thi Manager', activity: 'Viewed risk analysis report', module: 'Reports', status: 'Success' },
  { time: '09:15 AM', user: 'Nguyen Data', activity: 'Dataset validation completed', module: 'Data Management', status: 'Success' },
  { time: '08:55 AM', user: 'Admin System', activity: 'User role updated', module: 'User Management', status: 'Success' },
  { time: '08:30 AM', user: 'Pham Van Staff', activity: 'Viewed employee profile', module: 'Employees', status: 'Success' },
  { time: '07:48 AM', user: 'Nguyen Data', activity: 'Analysis completed for Q3 dataset', module: 'AI Model', status: 'Success' },
  { time: 'Yesterday', user: 'Le Thi Manager', activity: 'Workforce Risk Report generated', module: 'Reports', status: 'Success' },
];

export const dataRecords = [
  { id: 'EMP-001', name: 'Nguyen Van A', department: 'Engineering', completeness: 100, validationStatus: 'Valid', lastUpdated: 'Sep 22, 2026' },
  { id: 'EMP-002', name: 'Tran Thi B', department: 'Sales', completeness: 100, validationStatus: 'Valid', lastUpdated: 'Sep 22, 2026' },
  { id: 'EMP-003', name: 'Le Van C', department: 'Operations', completeness: 95, validationStatus: 'Warning', lastUpdated: 'Sep 21, 2026' },
  { id: 'EMP-004', name: 'Pham Thi D', department: 'Finance', completeness: 100, validationStatus: 'Valid', lastUpdated: 'Sep 20, 2026' },
  { id: 'EMP-005', name: 'Hoang Van E', department: 'Engineering', completeness: 88, validationStatus: 'Warning', lastUpdated: 'Sep 20, 2026' },
  { id: 'EMP-006', name: 'Nguyen Thi F', department: 'Marketing', completeness: 72, validationStatus: 'Invalid', lastUpdated: 'Sep 19, 2026' },
];

export const validationIssues = [
  { row: 3, empId: 'EMP-003', field: 'Job Satisfaction', issue: 'Missing value', severity: 'Warning', suggestion: 'Set to department median (3)', status: 'Pending' },
  { row: 5, empId: 'EMP-005', field: 'Monthly Income', issue: 'Value outside expected range ($0)', severity: 'Warning', suggestion: 'Verify or re-enter income data', status: 'Pending' },
  { row: 6, empId: 'EMP-006', field: 'Department', issue: 'Unknown department code "MKT2"', severity: 'Error', suggestion: 'Map to "Marketing"', status: 'Pending' },
  { row: 6, empId: 'EMP-006', field: 'Job Role', issue: 'Missing value', severity: 'Error', suggestion: 'Required field — must be entered manually', status: 'Pending' },
];

export const modelHistory = [
  { version: 'v2.3', status: 'Active', evalDate: 'Sep 20, 2026', dataset: 'Employee Dataset 2026-Q3', accuracy: 0.872, f1: 0.841 },
  { version: 'v2.2', status: 'Archived', evalDate: 'Jun 15, 2026', dataset: 'Employee Dataset 2026-Q2', accuracy: 0.859, f1: 0.828 },
  { version: 'v2.1', status: 'Archived', evalDate: 'Mar 10, 2026', dataset: 'Employee Dataset 2026-Q1', accuracy: 0.843, f1: 0.812 },
  { version: 'v2.0', status: 'Archived', evalDate: 'Dec 5, 2025', dataset: 'Employee Dataset 2025-Q4', accuracy: 0.831, f1: 0.798 },
];

export const confusionMatrix = {
  tp: 124, fp: 18,
  fn: 22, tn: 836,
};

export const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.05, tpr: 0.42 },
  { fpr: 0.1, tpr: 0.64 },
  { fpr: 0.2, tpr: 0.78 },
  { fpr: 0.3, tpr: 0.85 },
  { fpr: 0.5, tpr: 0.92 },
  { fpr: 0.7, tpr: 0.96 },
  { fpr: 1.0, tpr: 1.0 },
];

export const featureImportance = [
  { feature: 'Overtime', importance: 0.182 },
  { feature: 'Job Satisfaction', importance: 0.148 },
  { feature: 'Monthly Income', importance: 0.124 },
  { feature: 'Years at Company', importance: 0.112 },
  { feature: 'Age', importance: 0.094 },
  { feature: 'Work-Life Balance', importance: 0.087 },
  { feature: 'Environment Satisfaction', importance: 0.079 },
  { feature: 'Business Travel', importance: 0.072 },
  { feature: 'Job Level', importance: 0.058 },
  { feature: 'Job Involvement', importance: 0.044 },
];

export const reports = [
  { id: '1', name: 'Workforce Risk Summary', description: 'Organization-wide attrition risk overview with department breakdown and trend analysis.', lastGenerated: 'Sep 22, 2026', owner: 'Le Thi Manager', category: 'Overview' },
  { id: '2', name: 'Department Risk Analysis', description: 'Detailed risk analysis by department including contributing factors and employee distribution.', lastGenerated: 'Sep 20, 2026', owner: 'Le Thi Manager', category: 'Department' },
  { id: '3', name: 'High-Risk Employee Review', description: 'List of employees with high predicted attrition risk and supporting analysis details.', lastGenerated: 'Sep 18, 2026', owner: 'Pham Van Staff', category: 'Employee' },
  { id: '4', name: 'Attrition Factor Analysis', description: 'Analysis of the most significant factors contributing to predicted attrition across the workforce.', lastGenerated: 'Sep 15, 2026', owner: 'Le Thi Manager', category: 'Factors' },
  { id: '5', name: 'Model Analysis Summary', description: 'Technical summary of the AI model performance, evaluation metrics, and analysis quality.', lastGenerated: 'Sep 10, 2026', owner: 'Nguyen Data', category: 'AI Model' },
];

export const highRiskGroups = [
  { group: 'Engineering', employees: 287, highRisk: 42, avgRisk: 48, mainFactor: 'Overtime', trend: 'up' },
  { group: 'Sales', employees: 195, highRisk: 38, avgRisk: 52, mainFactor: 'Job Satisfaction', trend: 'up' },
  { group: 'Marketing', employees: 98, highRisk: 14, avgRisk: 41, mainFactor: 'Business Travel', trend: 'stable' },
  { group: 'Employees < 2 yr tenure', employees: 218, highRisk: 54, avgRisk: 61, mainFactor: 'Overtime', trend: 'up' },
  { group: 'Employees working overtime', employees: 312, highRisk: 89, avgRisk: 58, mainFactor: 'Overtime', trend: 'up' },
];
