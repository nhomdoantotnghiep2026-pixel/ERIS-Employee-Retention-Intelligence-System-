import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { employees as seedEmployees, type Employee } from '../data/mockData';

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  email?: string;
}

type BulkChanges = Partial<Pick<Employee, 'department' | 'role' | 'status'>>;

interface EmployeeContextValue {
  employees: Employee[];
  addEmployee: (input: EmployeeInput) => Employee | null;
  importEmployees: (rows: EmployeeInput[]) => { created: number; skipped: number };
  bulkUpdate: (ids: string[], changes: BulkChanges) => number;
}

const STORAGE_KEY = 'eris-employees';
const EmployeeContext = createContext<EmployeeContextValue | null>(null);

function loadEmployees() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : null;
    return Array.isArray(parsed) ? parsed as Employee[] : seedEmployees;
  } catch {
    return seedEmployees;
  }
}

function makeEmployee(input: EmployeeInput): Employee {
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const initials = `${input.firstName.trim()[0] || ''}${input.lastName.trim()[0] || ''}`.toUpperCase();
  return {
    id: `employee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    initials,
    department: input.department.trim(),
    role: input.jobTitle.trim(),
    tenure: 0,
    jobSatisfaction: 3,
    riskLevel: 'Low',
    riskScore: 0,
    lastAnalysis: 'Not analyzed',
    age: 0,
    businessTravel: 'Never',
    overtime: false,
    monthlyIncome: 0,
    jobLevel: 1,
    environmentSatisfaction: 3,
    workLifeBalance: 3,
    email: input.email?.trim() || '',
    employeeId: input.employeeId.trim(),
    status: 'Active',
  };
}

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (input: EmployeeInput) => {
    const required = [input.firstName, input.lastName, input.employeeId, input.department, input.jobTitle];
    if (required.some(value => !value.trim())) return null;
    if (employees.some(employee => employee.employeeId.toLowerCase() === input.employeeId.trim().toLowerCase())) return null;
    const created = makeEmployee(input);
    setEmployees(current => [...current, created]);
    return created;
  };

  const importEmployees = (rows: EmployeeInput[]) => {
    const known = new Set(employees.map(employee => employee.employeeId.toLowerCase()));
    const accepted: Employee[] = [];
    for (const row of rows) {
      const key = row.employeeId.trim().toLowerCase();
      const required = [row.firstName, row.lastName, row.employeeId, row.department, row.jobTitle];
      if (required.some(value => !value.trim()) || !key || known.has(key)) continue;
      known.add(key);
      accepted.push(makeEmployee(row));
    }
    setEmployees(current => [...current, ...accepted]);
    return { created: accepted.length, skipped: rows.length - accepted.length };
  };

  const bulkUpdate = (ids: string[], changes: BulkChanges) => {
    const selected = new Set(ids);
    const affected = employees.filter(employee => selected.has(employee.id)).length;
    if (!affected || !Object.keys(changes).length) return 0;
    setEmployees(current => current.map(employee => selected.has(employee.id) ? { ...employee, ...changes } : employee));
    return affected;
  };

  return <EmployeeContext.Provider value={{ employees, addEmployee, importEmployees, bulkUpdate }}>{children}</EmployeeContext.Provider>;
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployees must be used inside EmployeeProvider');
  return context;
}
