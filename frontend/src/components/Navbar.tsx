'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          🛺 Dhaka Tesla Pool
        </Link>
      </div>
      <div className="flex-none gap-2">
        {!loading && user && (
          <>
            <Link
              href={user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard'}
              className="btn btn-ghost"
            >
              Dashboard
            </Link>
            <span className="hidden sm:inline text-sm text-base-content/60">
              {user.fullName} · {user.role}
            </span>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Log out
            </button>
          </>
        )}
        {!loading && !user && (
          <>
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
