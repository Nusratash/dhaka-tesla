'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/Spinner';

// Route-group-level auth guard: redirects anyone who isn't a logged-in
// passenger away, so every page under /passenger/* is protected in one place.
export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'passenger')) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'passenger') return <Spinner label="Checking your session…" />;

  return <>{children}</>;
}
