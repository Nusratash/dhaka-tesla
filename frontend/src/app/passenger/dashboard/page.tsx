'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, extractErrorMessage } from '@/lib/api';
import { RideRequest } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { poyshaToBdt } from '@/lib/types';

const ACTIVE_STATUSES = ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED'];

export default function PassengerDashboard() {
  const [requests, setRequests] = useState<RideRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RideRequest[]>('/rides/mine')
      .then((res) => setRequests(res.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const active = requests?.filter((r) => ACTIVE_STATUSES.includes(r.status)) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your rides</h1>
        <Link href="/passenger/request" className="btn btn-primary">
          + Request a ride
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}
      {!error && requests === null && <Spinner label="Loading your rides…" />}

      {requests !== null && active.length === 0 && (
        <EmptyState
          title="No active rides right now"
          subtitle="Request a ride and, if someone's heading your way, you'll be pooled automatically."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {active.map((r) => (
          <Link key={r.id} href={`/passenger/rides/${r.id}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {r.pickupZone} → {r.destinationZone}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-base-content/60 mt-1">
                  {r.seatsRequested} seat{r.seatsRequested > 1 ? 's' : ''} · Tesla{' '}
                  {r.pool?.tesla?.nickname ?? 'matching…'}
                </p>
                {r.fare && (
                  <p className="text-sm mt-2 font-medium">৳{poyshaToBdt(r.fare.totalFarePoysha)}</p>
                )}
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {requests !== null && (
        <Link href="/passenger/history" className="link link-primary text-sm self-start">
          View full ride history →
        </Link>
      )}
    </div>
  );
}
