import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'HR' | 'Data / AI Analyst' | 'System Administrator' | 'Employee / ESS';

interface RoleUser {
  name: string;
  initials: string;
  role: UserRole;
  email: string;
}

export const ROLE_USERS: RoleUser[] = [
  { name: 'Le Thi HR', initials: 'LH', role: 'HR', email: 'hr@eris.com' },
  { name: 'Nguyen Data', initials: 'ND', role: 'Data / AI Analyst', email: 'analyst@eris.com' },
  { name: 'Admin System', initials: 'AS', role: 'System Administrator', email: 'admin@eris.com' },
  { name: 'Nguyen Van A', initials: 'NA', role: 'Employee / ESS', email: 'employee@eris.com' },
];

interface RoleContextValue {
  user: RoleUser;
  isAuthenticated: boolean;
  setUser: (u: RoleUser) => void;
  signOut: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const storedUser = (() => {
    try {
      const stored = sessionStorage.getItem('eris-user');
      const parsed = stored ? JSON.parse(stored) as RoleUser : null;
      return ROLE_USERS.find(candidate => candidate.email === parsed?.email) || null;
    } catch {
      return null;
    }
  })();
  const [user, setUserState] = useState<RoleUser>(storedUser || ROLE_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedUser));
  const setUser = (next: RoleUser) => {
    sessionStorage.setItem('eris-user', JSON.stringify(next));
    setUserState(next);
    setIsAuthenticated(true);
  };
  const signOut = () => {
    sessionStorage.removeItem('eris-user');
    setIsAuthenticated(false);
  };
  return <RoleContext.Provider value={{ user, isAuthenticated, setUser, signOut }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
