import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { RolePermission } from '../../types';

interface RoleGuardProps {
  permission: keyof RolePermission['permissions'];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RoleGuard({ 
  permission, 
  fallback = null, 
  children 
}: RoleGuardProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
