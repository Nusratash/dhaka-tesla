'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, extractErrorMessage } from '@/lib/api';
import { Pool, RideStatus, Tesla, poyshaToBdt } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PoolSeatIndicator } from '@/components/PoolSeatIndicator';

// Next legal status per current one, mirroring the backend's
// ALLOWED_TRANSITIONS map so the driver only ever sees a valid next action.
const NEXT_STATUS: Partial<Record<RideStatus, { label: string; status: RideStatus }>> = {
  REQUESTED: { label: 'Accept ride', status: 'MATCHED' },
  MATCHED: { label: "Mark I've arrived", status: 'DRIVER_ARRIVED' },
  DRIVER_ARRIVED: { label: 'Start trip', status: 'STARTED' },
  STARTED: { label: 'Complete trip', status: 'COMPLETED' },
};

function RegisterTeslaForm({ onRegistered }: { onRegistered: (t: Tesla) => void }) {
  const [nickname, setNickname] = useState('Bullet');
  const [plateNumber, setPlateNumber] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post<Tesla>('/teslas', { nickname, plateNumber, seatCapacity });
      onRegistered(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardBody>
        <h2 className="card-title">Register your Tesla</h2>
        <p className="text-sm text-base-content/60">One-time setup so passengers can be matched to your vehicle.</p>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-2">
          <label className="form-control">
            <span className="label-text mb-1">Nickname</span>
            <input className="input input-bordered" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Plate number</span>
            <input className="input input-bordered" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Seat capacity</span>
            <input
              type="number"
              min={1}
              max={6}
              className="input input-bordered"
              value={seatCapacity}
              onChange={(e) => setSeatCapacity(Number(e.target.value))}
              required
            />
          </label>
          <button className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Register Tesla'}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}

export default function DriverDashboard() {
  const [tesla, setTesla] = useState<Tesla | null | undefined>(undefined); // undefined = loading
  const [online, setOnline] = useState(false);
  const [pools, setPools] = useState<Pool[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadTesla = useCallback(() => {
    api
      .get<Tesla>('/teslas/mine')
      .then((res) => setTesla(res.data))
      .catch(() => setTesla(null));
  }, []);

  const loadPools = useCallback(() => {
    api
      .get<Pool[]>('/pools/mine')
      .then((res) => setPools(res.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    loadTesla();
  }, [loadTesla]);

  useEffect(() => {
    if (tesla) {
      loadPools();
      const interval = setInterval(loadPools, 5000);
      return () => clearInterval(interval);
    }
  }, [tesla, loadPools]);

  async function toggleOnline() {
    const next = !online;
    setOnline(next);
    try {
      await api.patch('/teslas/online', { online: next });
    } catch (err) {
      setOnline(!next);
      setActionError(extractErrorMessage(err));
    }
  }

  async function advance(poolId: string, status: RideStatus) {
    setActionError(null);
    try {
      await api.patch(`/pools/${poolId}/status`, { status });
      loadPools();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  if (tesla === undefined) return <Spinner label="Loading your Tesla…" />;
  if (tesla === null) return <RegisterTeslaForm onRegistered={(t) => setTesla(t)} />;

  const activePools = pools?.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED') ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{tesla.nickname}</h1>
          <p className="text-sm text-base-content/60">
            Plate {tesla.plateNumber} · {tesla.seatCapacity} seats
          </p>
        </div>
        <label className="label cursor-pointer gap-3">
          <span className="label-text">{online ? 'Online' : 'Offline'}</span>
          <input type="checkbox" className="toggle toggle-primary" checked={online} onChange={toggleOnline} />
        </label>
      </div>

      {actionError && <ErrorAlert message={actionError} />}
      {error && <ErrorAlert message={error} />}
      {pools === null && !error && <Spinner label="Loading ride requests…" />}

      {pools !== null && activePools.length === 0 && (
        <EmptyState
          title={online ? 'No ride requests yet' : "You're offline"}
          subtitle={online ? "You'll see requests here as soon as a passenger books a compatible route." : 'Go online to start receiving ride requests.'}
        />
      )}

      <div className="grid gap-4">
        {activePools.map((pool) => {
          const next = NEXT_STATUS[pool.status];
          return (
            <Card key={pool.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Pool #{pool.id.slice(0, 8)}</p>
                  <StatusBadge status={pool.status} />
                </div>
                <PoolSeatIndicator taken={pool.seatsTaken} capacity={tesla.seatCapacity} />
                <ul className="mt-3 text-sm divide-y divide-base-200">
                  {pool.requests
                    ?.filter((r) => r.status !== 'CANCELLED')
                    .map((r) => (
                      <li key={r.id} className="py-2 flex items-center justify-between">
                        <span>
                          {r.passenger?.fullName ?? 'Passenger'} · {r.pickupZone} → {r.destinationZone} ·{' '}
                          {r.seatsRequested} seat{r.seatsRequested > 1 ? 's' : ''}
                        </span>
                        {r.fare && <span className="font-medium">৳{poyshaToBdt(r.fare.totalFarePoysha)}</span>}
                      </li>
                    ))}
                </ul>
                {next && (
                  <button className="btn btn-primary btn-sm mt-4 self-start" onClick={() => advance(pool.id, next.status)}>
                    {next.label}
                  </button>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
