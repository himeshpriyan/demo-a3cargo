import React, { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { type Permission, type UserRole } from '../types/auth';

interface PermissionGateProps {
  permission?: Permission;
  roles?: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  mask?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  roles,
  children,
  fallback = null,
  mask = false,
}) => {
  const { can, hasRole } = useAuth();

  let hasAccess = true;

  if (permission && !can(permission)) {
    hasAccess = false;
  }

  if (roles && !hasRole(roles)) {
    hasAccess = false;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (mask) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-400 border border-slate-200 select-none" title="Access Restricted by Role">
        •••••• [CONFIDENTIAL]
      </span>
    );
  }

  return <>{fallback}</>;
};
