'use client';
import { useSearchParams } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { useState, useEffect } from 'react';

export function useRole() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      setRole(roleParam as UserRole);
    } else {
      setRole(null);
    }
    setIsLoading(false);
  }, [searchParams]);

  return { role, isLoading };
}

export { UserRole };
