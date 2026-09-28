'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, extractErrorMessage } from '@/lib/api';
import { RideRequest, poyshaToBdt } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PoolSeatIndicator } from '@/components/PoolSeatIndicator';

const CANCELLABLE = ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED'];

export default function RideDetailPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<RideRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    api
      .get<RideRequest>(`/rides/${rideId}`)
      .then((res) => setRide(res.data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, [rideId]);

  useEffect(() => {
    load();
  }, [load]);

  // CSR live status: try Pusher for instant updates, and always keep a
  // lightweight poll as a fallback so this works even without Pusher configured.
  useEffect(() => {
    if (!ride?.pool?.id) return;
    const interval = setInterval(load, 5000);

    let pusherClient: any;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (key) {
      import('pusher-js').then(({ default: Pusher }) => {
        pusherClient = new Pusher(key, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2' });
        const channel = pusherClient.subscribe(`pool-${ride.pool!.id}`);
        channel.bind('status-update', load);
      });
    }

    return () => {
      clearInterval(interval);
      pusherClient?.disconnect?.();
    };
  }, [ride?.pool?.id, load]);

  async function onCancel() {
    if (!ride) return;
    setCancelling(true);
    setError(null);
    try {
      await api.patch(`/rides/${ride.id}/cancel`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (error) return <ErrorAlert message={error} />;
  if (!ride) return <Spinner label="Loading ride…" />;

  const poolmates = ride.pool?.requests?.filter((r) => r.id !== ride.id && r.status !== 'CANCELLED') ?? [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <button className="link text-sm self-start" onClick={() => router.push('/passenger/dashboard')}>
        ← Back to your rides
      </button>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {ride.pickupZone} → {ride.destinationZone}
            </h1>
            <StatusBadge status={ride.status} />
          </div>

          {ride.pool && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-base-content/60">
                Tesla <span className="font-medium">{ride.pool.tesla.nickname}</span> · plate{' '}
                {ride.pool.tesla.plateNumber}
              </p>
              <PoolSeatIndicator taken={ride.pool.seatsTaken} capacity={ride.pool.tesla.seatCapacity} />
            </div>
          )}

          {poolmates.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Sharing this Tesla with:</p>
              <ul className="text-sm text-base-content/70 list-disc list-inside">
                {poolmates.map((m) => (
                  <li key={m.id}>
                    {m.passenger?.fullName ?? 'Another passenger'} · {m.pickupZone} → {m.destinationZone}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ride.fare && (
            <div className="mt-4 rounded-lg bg-base-200 p-4 text-sm">
              <p className="flex justify-between">
                <span>Base fare</span>
                <span>৳{poyshaToBdt(ride.fare.baseFarePoysha)}</span>
              </p>
              <p className="flex justify-between">
                <span>Distance charge</span>
                <span>৳{poyshaToBdt(ride.fare.distanceChargePoysha)}</span>
              </p>
              {ride.fare.poolDiscountPoysha > 0 && (
                <p className="flex justify-between text-success">
                  <span>Pool discount</span>
                  <span>-৳{poyshaToBdt(ride.fare.poolDiscountPoysha)}</span>
                </p>
              )}
              <div className="divider my-1" />
              <p className="flex justify-between font-semibold">
                <span>Your fare</span>
                <span>৳{poyshaToBdt(ride.fare.totalFarePoysha)}</span>
              </p>
            </div>
          )}

          {CANCELLABLE.includes(ride.status) && (
            <button className="btn btn-error btn-outline mt-6 self-start" onClick={onCancel} disabled={cancelling}>
              {cancelling ? <span className="loading loading-spinner loading-sm" /> : 'Cancel ride'}
            </button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
