import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'HR Staff' | 'HR Manager' | 'Data / AI Analyst' | 'System Administrator';

interface RoleUser {
  name: string;
  initials: string;
  role: UserRole;
  email: string;
}

export const ROLE_USERS: RoleUser[] = [
  { name: 'Pham Van Staff', initials: 'PS', role: 'HR Staff', email: 'staff@eris.com' },
  { name: 'Le Thi Manager', initials: 'LM', role: 'HR Manager', email: 'manager@eris.com' },
  { name: 'Nguyen Data', initials: 'ND', role: 'Data / AI Analyst', email: 'analyst@eris.com' },
  { name: 'Admin System', initials: 'AS', role: 'System Administrator', email: 'admin@eris.com' },
];

interface RoleContextValue {
  user: RoleUser;
  setUser: (u: RoleUser) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RoleUser>(ROLE_USERS[1]); // default HR Manager
  return <RoleContext.Provider value={{ user, setUser }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
