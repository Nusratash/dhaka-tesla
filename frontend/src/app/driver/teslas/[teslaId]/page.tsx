'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Pool, Tesla, poyshaToBdt } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Driver ride history for a Tesla (dynamic route). Only the owner's Tesla
// resolves; anything else 404s because /teslas/mine is caller-scoped.
export default function TeslaHistoryPage() {
  const { teslaId } = useParams<{ teslaId: string }>();
  const [tesla, setTesla] = useState<Tesla | null | undefined>(undefined);
  const [pools, setPools] = useState<Pool[] | null>(null);

  useEffect(() => {
    api.get<Tesla>('/teslas/mine').then((r) => setTesla(r.data)).catch(() => setTesla(null));
    api.get<Pool[]>('/pools/mine').then((r) => setPools(r.data));
  }, []);

  if (tesla === undefined || pools === null) return <Spinner label="Loading history…" />;
  if (tesla === null || tesla.id !== teslaId) notFound();

  const done = pools.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED');
  if (done.length === 0) return <EmptyState title="No finished trips yet" />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{tesla.nickname} — trip history</h1>
      {done.map((p) => (
        <div key={p.id} className="card bg-base-100 shadow-sm border border-base-200 card-body">
          <div className="flex justify-between"><span>Pool #{p.id.slice(0, 8)}</span><StatusBadge status={p.status} /></div>
          <ul className="text-sm">
            {p.requests?.map((r) => (
              <li key={r.id}>{r.passenger?.fullName} · {r.pickupZone} → {r.destinationZone} · ৳{r.fare ? poyshaToBdt(r.fare.totalFarePoysha) : '—'}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
