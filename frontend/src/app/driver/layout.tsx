'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/Spinner';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'driver')) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'driver') return <Spinner label="Checking your session…" />;

  return <>{children}</>;
}
