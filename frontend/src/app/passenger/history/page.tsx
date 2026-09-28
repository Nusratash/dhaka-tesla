'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, extractErrorMessage } from '@/lib/api';
import { RideRequest, poyshaToBdt } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PassengerHistoryPage() {
  const [requests, setRequests] = useState<RideRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RideRequest[]>('/rides/mine')
      .then((res) => setRequests(res.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  if (error) return <ErrorAlert message={error} />;
  if (!requests) return <Spinner label="Loading history…" />;
  if (requests.length === 0) return <EmptyState title="No rides yet" subtitle="Your ride history will show up here." />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Ride history</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Status</th>
              <th>Fare</th>
              <th>Requested</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.pickupZone} → {r.destinationZone}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.fare ? `৳${poyshaToBdt(r.fare.totalFarePoysha)}` : '—'}</td>
                <td className="text-sm text-base-content/60">{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/passenger/rides/${r.id}`} className="link link-primary text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
