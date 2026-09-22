import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type UserRole, type UserPersona, type Permission, USER_PERSONAS } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  user: UserPersona;
  allPersonas: typeof USER_PERSONAS;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  can: (permission: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'a3_is_authenticated_v1';
const STORAGE_KEY_ROLE = 'a3_active_user_role';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole;
    return saved && USER_PERSONAS[saved] ? saved : 'SUPER_ADMIN';
  });

  const user = USER_PERSONAS[currentRole];

  const loginAsRole = (role: UserRole) => {
    if (USER_PERSONAS[role]) {
      setCurrentRole(role);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_ROLE, role);
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    }
  };

  const login = (email: string, password = ''): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // Map common aliases
    const aliasMap: Record<string, UserRole> = {
      'admin@a3cargo.lk': 'SUPER_ADMIN',
      'ops@a3cargo.lk': 'OPS_MANAGER',
      'customs@a3cargo.lk': 'CUSTOMS_OFFICER',
      'procurement@a3cargo.in': 'PROCUREMENT_OFFICER',
      'sales@a3cargo.lk': 'SALES_EXECUTIVE',
      'finance@a3cargo.lk': 'FINANCE_CONTROLLER',
      'warehouse@a3cargo.lk': 'WAREHOUSE_OFFICER',
    };

    let targetRole: UserRole | null = aliasMap[cleanEmail] || null;

    if (!targetRole) {
      // Find persona matching email
      const matched = (Object.keys(USER_PERSONAS) as UserRole[]).find(
        r => USER_PERSONAS[r].email.toLowerCase() === cleanEmail
      );
      if (matched) targetRole = matched;
    }

    // Default fallback to Super Admin if email includes admin or if password is demo123
    if (!targetRole && (cleanEmail.includes('admin') || cleanEmail === 'demo@a3cargo.com')) {
      targetRole = 'SUPER_ADMIN';
    }

    if (!targetRole) {
      return {
        success: false,
        message: 'Invalid credentials. Please click a Demo Persona button below or enter a registered demo email.',
      };
    }

    loginAsRole(targetRole);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const switchRole = (newRole: UserRole) => {
    if (USER_PERSONAS[newRole]) {
      setCurrentRole(newRole);
      localStorage.setItem(STORAGE_KEY_ROLE, newRole);
    }
  };

  const can = (permission: Permission): boolean => {
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        user,
        allPersonas: USER_PERSONAS,
        login,
        loginAsRole,
        logout,
        switchRole,
        can,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
