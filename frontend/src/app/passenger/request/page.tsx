'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, extractErrorMessage } from '@/lib/api';
import { Zone } from '@/lib/types';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';

// Client-side validation mirrors the backend DTO (pickup/destination must
// be known zones, 1-3 seats) - in addition to, never instead of, the
// NestJS ValidationPipe on the actual submit.
export default function RequestRidePage() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [pickupZone, setPickupZone] = useState('');
  const [destinationZone, setDestinationZone] = useState('');
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Zone[]>('/zones').then((res) => {
      setZones(res.data);
      setPickupZone(res.data[0]?.name ?? '');
      setDestinationZone(res.data[1]?.name ?? '');
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pickupZone === destinationZone) {
      setError('Pickup and destination must be different zones.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/rides', { pickupZone, destinationZone, seatsRequested: seats });
      router.push(`/passenger/rides/${data.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!zones) return <Spinner label="Loading Dhaka zones…" />;

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow-md">
      <div className="card-body">
        <h1 className="card-title">Request a ride</h1>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Pickup</span>
            <select className="select select-bordered" value={pickupZone} onChange={(e) => setPickupZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Destination</span>
            <select className="select select-bordered" value={destinationZone} onChange={(e) => setDestinationZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">Seats</span>
            <select className="select select-bordered" value={seats} onChange={(e) => setSeats(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <button className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Find a Tesla'}
          </button>
        </form>
      </div>
    </div>
  );
}
