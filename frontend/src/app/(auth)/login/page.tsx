'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { extractErrorMessage } from '@/lib/api';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('nusrat@teslapool.example');
  const [password, setPassword] = useState('Passw0rd!');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow-md">
      <div className="card-body">
        <h1 className="card-title">Log in</h1>
        <p className="text-sm text-base-content/60 mb-2">
          Demo: {email} / Passw0rd! (or use jashim@teslapool.example for the driver view)
        </p>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Email</span>
            <input
              type="email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Password</span>
            <input
              type="password"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Log in'}
          </button>
        </form>
        <p className="text-sm mt-3">
          No account?{' '}
          <Link href="/register" className="link link-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
