import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type UserRole, type UserPersona, type Permission, USER_PERSONAS } from '../types/auth';

interface AuthContextType {
  currentRole: UserRole;
  user: UserPersona;
  allPersonas: typeof USER_PERSONAS;
  switchRole: (role: UserRole) => void;
  can: (permission: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_ROLE = 'a3_active_user_role';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole;
    return saved && USER_PERSONAS[saved] ? saved : 'SUPER_ADMIN';
  });

  const user = USER_PERSONAS[currentRole];

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
        currentRole,
        user,
        allPersonas: USER_PERSONAS,
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
