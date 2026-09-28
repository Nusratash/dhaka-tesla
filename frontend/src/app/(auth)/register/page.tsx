'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { extractErrorMessage } from '@/lib/api';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function RegisterPage() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'driver' ? 'driver' : 'passenger';

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: initialRole as 'passenger' | 'driver',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow-md">
      <div className="card-body">
        <h1 className="card-title">Create an account</h1>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="join w-full">
            <button
              type="button"
              className={`btn join-item flex-1 ${form.role === 'passenger' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => update('role', 'passenger')}
            >
              Passenger
            </button>
            <button
              type="button"
              className={`btn join-item flex-1 ${form.role === 'driver' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => update('role', 'driver')}
            >
              Driver
            </button>
          </div>

          <label className="form-control">
            <span className="label-text mb-1">Full name</span>
            <input className="input input-bordered" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Email</span>
            <input type="email" className="input input-bordered" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Phone (BD format, e.g. +8801xxxxxxxxx)</span>
            <input className="input input-bordered" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Password (min. 8 characters)</span>
            <input type="password" className="input input-bordered" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8} />
          </label>

          <button className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : `Sign up as ${form.role}`}
          </button>
        </form>
        <p className="text-sm mt-3">
          Already have an account?{' '}
          <Link href="/login" className="link link-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
