'use client';

import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function RideError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-8 flex flex-col gap-4">
      <ErrorAlert message={error.message || 'Could not load this ride.'} />
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
